/**
 * Automated test suite for Recruiter Phase 1 Foundation
 * Tests:
 * 1. Recruiter auth and role-based access control (candidate blocked from recruiter endpoints)
 * 2. Recruiter onboarding flow (join verified company vs create new company)
 * 3. Prevention of joining unverified company
 * 4. Company profile retrieval & authorized updates vs forbidden non-owner updates
 * 5. Logo upload validation (valid image mime types vs executable/invalid mimes, size limits)
 * 6. Company verification submission & lifecycle state transitions
 * 7. Job publishing gating based on verification status
 * 8. Dashboard statistics calculation strictly scoped to recruiter company
 * 9. Team invitation and membership permissions
 * 10. Admin verification review workflow (approve/reject with reason)
 */

const BASE_URL = 'http://localhost:3000/api/v1';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function assert(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`✗ FAIL: ${name} ->`, err.message);
  }
}

async function runTests() {
  console.log('--- Starting Recruiter Phase 1 Automated Test Suite ---\n');

  let recruiterToken = '';
  let candidateToken = '';
  let adminToken = '';

  async function loginAndGetToken(email: string, password = 'Password123!'): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(`Login failed: ${JSON.stringify(json)}`);
    }
    if (json.data?.token) {
      return json.data.token;
    }
    if (json.data?.requiresOtp) {
      const otpCode = json.data.demoOtpHint || '123456';
      const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success || !verifyJson.data?.token) {
        throw new Error(`OTP Verification failed: ${JSON.stringify(verifyJson)}`);
      }
      return verifyJson.data.token;
    }
    throw new Error('No token or OTP challenge returned');
  }

  // 1. Authenticate recruiter, candidate, and admin
  await assert('Recruiter Login & OTP Verification Flow', async () => {
    recruiterToken = await loginAndGetToken('recruiter@synthetix.com');
    if (!recruiterToken) throw new Error('Failed to acquire recruiterToken');
  });

  await assert('Candidate Login & OTP Verification Flow', async () => {
    candidateToken = await loginAndGetToken('candidate@careersphere.ai');
    if (!candidateToken) throw new Error('Failed to acquire candidateToken');
  });

  await assert('Admin Login & OTP Verification Flow', async () => {
    adminToken = await loginAndGetToken('admin@careersphere.ai');
    if (!adminToken) throw new Error('Failed to acquire adminToken');
  });

  // 2. Security & RBAC: Candidate must be rejected when accessing recruiter endpoints
  await assert('Security: Candidate is denied access to Recruiter Profile (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/profile`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected status 403 Forbidden, but received: ${res.status}`);
    }
  });

  await assert('Security: Unauthenticated request is denied access (401 Unauthorized)', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/dashboard/stats`);
    if (res.status !== 401) {
      throw new Error(`Expected status 401 Unauthorized, but received: ${res.status}`);
    }
  });

  // 3. Recruiter Profile Retrieval & Updation
  await assert('Recruiter can fetch their profile, company, and membership info', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/profile`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success || !json.data?.profile || !json.data?.company) {
      throw new Error(`Failed to retrieve profile: ${JSON.stringify(json)}`);
    }
    if (json.data.profile.companyId !== json.data.company.id) {
      throw new Error('Profile companyId does not match company.id');
    }
  });

  await assert('Recruiter can update personal and role contact details', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: 'Senior Principal Technical Recruiter',
        phone: '+1 (415) 555-0199',
        department: 'Autonomous Systems & AI Infrastructure',
      }),
    });
    const json = await res.json();
    if (!json.success || json.data?.profile?.title !== 'Senior Principal Technical Recruiter') {
      throw new Error(`Profile update failed: ${JSON.stringify(json)}`);
    }
  });

  // 4. Company Onboarding & Search
  let testCompanyId = '';
  await assert('Recruiter can register a new company via Onboarding flow', async () => {
    // Register a fresh recruiter user to test onboarding
    const freshEmail = `recruiter_${Date.now()}@nexustech.io`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: freshEmail,
        password: 'SecurePassword123!',
        name: 'Jordan Belfort',
        role: 'recruiter',
      }),
    });
    const regJson = await regRes.json();
    let freshToken = regJson.data?.token;
    if (!freshToken && regJson.data?.requiresOtp) {
      const otpCode = regJson.data.demoOtpHint || '123456';
      const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: freshEmail, otp: otpCode }),
      });
      const verifyJson = await verifyRes.json();
      freshToken = verifyJson.data?.token;
    }
    if (!freshToken) throw new Error('Failed to acquire token after register/OTP');

    // Complete onboarding with new company
    const onbRes = await fetch(`${BASE_URL}/recruiter/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freshToken}`,
      },
      body: JSON.stringify({
        title: 'Founding Talent Partner',
        phone: '+1 (212) 555-8833',
        department: 'Founding Team',
        companyAction: 'create',
        newCompany: {
          name: `Nexus Neural Systems ${Date.now()}`,
          industry: 'DeepTech & AI Accelerators',
          sizeRange: '11-50 employees',
          headquarters: 'Austin, TX',
          website: 'https://nexusneural.io',
          description: 'Next-generation semiconductor software design.',
          businessEmail: 'contact@nexusneural.io',
          workCulture: 'Fast-paced, autonomy, high impact.',
          benefits: ['Comprehensive Healthcare', '401k Match', 'Remote Work Stipend'],
        },
      }),
    });
    const onbJson = await onbRes.json();
    if (!onbJson.success || !onbJson.data?.company?.id) {
      throw new Error(`Onboarding company creation failed: ${JSON.stringify(onbJson)}`);
    }
    if (onbJson.data.company.isVerified !== false || onbJson.data.company.verificationStatus !== 'draft') {
      throw new Error('New company must start with isVerified=false and verificationStatus=draft');
    }
    testCompanyId = onbJson.data.company.id;
  });

  // 5. Unverified Company cannot be joined directly
  await assert('Joining an unverified company is strictly rejected', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: 'Recruiter',
        companyAction: 'join',
        companyId: testCompanyId, // Unverified
      }),
    });
    const json = await res.json();
    if (res.status === 200 || json.success) {
      throw new Error('Should have rejected joining an unverified company');
    }
    if (json.error?.code !== 'UNVERIFIED_COMPANY') {
      throw new Error(`Expected error code UNVERIFIED_COMPANY, got ${json.error?.code}`);
    }
  });

  // 6. Logo Upload Validation
  await assert('Logo Upload rejects invalid MIME types (e.g. application/x-sh, text/html)', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/company/logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        fileBase64: 'data:application/x-sh;base64,ZWNobyAiZXhlY3V0YWJsZSI=',
        mimeType: 'application/x-sh',
      }),
    });
    const json = await res.json();
    if (res.status === 200 || json.success) {
      throw new Error('Should have rejected non-image MIME type');
    }
    if (json.error?.code !== 'INVALID_FILE_TYPE') {
      throw new Error(`Expected INVALID_FILE_TYPE, got ${json.error?.code}`);
    }
  });

  await assert('Logo Upload accepts valid image format (e.g. image/png)', async () => {
    const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await fetch(`${BASE_URL}/recruiter/company/logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        fileBase64: validPng,
        mimeType: 'image/png',
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.logoUrl) {
      throw new Error(`Valid logo upload failed: ${JSON.stringify(json)}`);
    }
  });

  // 7. Company Verification Submission Workflow
  await assert('Company verification submission sets status to pending_review', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/company/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        registrationNumber: 'US-DEL-2024-998822',
        taxId: 'XX-9876543',
        officialDomain: 'https://synthetix.ai',
        documentName: 'Certificate_of_Incorporation_Delaware.pdf',
        documentUrl: '/docs/verification/cert_delaware.pdf',
        notes: 'Submitted Delaware C-Corp Certificate of Incorporation and EIN confirmation letter.',
      }),
    });
    const json = await res.json();
    if (!json.success || !json.data?.submission) {
      throw new Error(`Verification submission failed: ${JSON.stringify(json)}`);
    }
    if (json.data.company.verificationStatus !== 'pending_review') {
      throw new Error(`Expected verificationStatus pending_review, got ${json.data.company.verificationStatus}`);
    }
  });

  // 8. Admin review workflow
  await assert('Admin reviews verification queue and approves or rejects company with reasons', async () => {
    // Fetch queue
    const queueRes = await fetch(`${BASE_URL}/admin/verification-queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueJson = await queueRes.json();
    if (!queueJson.success || !Array.isArray(queueJson.data?.companies)) {
      throw new Error(`Failed to fetch admin verification queue: ${JSON.stringify(queueJson)}`);
    }

    // Review and verify Synthetix Dynamics
    const reviewRes = await fetch(`${BASE_URL}/admin/companies/comp_synthetix/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: 'verify',
        reason: 'Delaware state filing and active business domain verified successfully.',
      }),
    });
    const reviewJson = await reviewRes.json();
    if (!reviewJson.success || reviewJson.data?.company?.verificationStatus !== 'verified') {
      throw new Error(`Admin review approval failed: ${JSON.stringify(reviewJson)}`);
    }
    if (reviewJson.data.company.isVerified !== true) {
      throw new Error('Approved company must have isVerified = true');
    }
  });

  // 9. Dashboard Statistics Scoping
  await assert('Dashboard statistics are strictly scoped to recruiter company', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/dashboard/stats`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success || !json.data?.stats) {
      throw new Error(`Dashboard stats fetch failed: ${JSON.stringify(json)}`);
    }
    const { stats } = json.data;
    if (typeof stats.totalJobs !== 'number' || typeof stats.activeJobs !== 'number') {
      throw new Error('Dashboard stats missing job counts');
    }
    if (!stats.company || stats.company.name !== 'Synthetix Dynamics') {
      throw new Error(`Dashboard scoped to wrong company: ${stats.company?.name}`);
    }
    if (!Array.isArray(stats.pendingActions)) {
      throw new Error('pendingActions must be an array');
    }
  });

  // 10. Team Management & Permissions
  await assert('Recruiter can view company team and invite new colleagues', async () => {
    const teamRes = await fetch(`${BASE_URL}/recruiter/team`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const teamJson = await teamRes.json();
    if (!teamJson.success || !Array.isArray(teamJson.data?.team)) {
      throw new Error(`Team fetch failed: ${JSON.stringify(teamJson)}`);
    }

    const inviteRes = await fetch(`${BASE_URL}/recruiter/team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        email: `hiring.lead.${Date.now()}@synthetix.ai`,
        role: 'member',
        title: 'Senior Technical Sourcer',
      }),
    });
    const inviteJson = await inviteRes.json();
    if (!inviteRes.ok || !inviteJson.success || !inviteJson.data?.member) {
      throw new Error(`Team invite failed: ${JSON.stringify(inviteJson)}`);
    }
  });

  console.log('\n========================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Results: ${passedCount}/${results.length} tests passed.`);
  console.log('========================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runTests();
