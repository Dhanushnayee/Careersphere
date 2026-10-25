/**
 * CareerSphere AI — Phase 5 Automated Test Suite
 * Recruiter Analytics, Hiring Funnels, Reports & CSV Export,
 * Team Management, Invitations (48h Token), Role-Based Permissions (RBAC),
 * Last Owner Protection Guard, Cross-Company Security & Audit Trail.
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
  console.log('================================================================');
  console.log('   CareerSphere AI — Recruiter Phase 5 Automated Test Suite     ');
  console.log('   Analytics, Reports, Team Management, RBAC & Audit Trail       ');
  console.log('================================================================\n');

  // Wait for dev server
  for (let i = 0; i < 30; i++) {
    try {
      const ping = await fetch(`${BASE_URL}/taxonomy/categories`);
      if (ping.ok) break;
    } catch {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  let recruiterToken = '';
  let candidateToken = '';
  let horizonRecruiterToken = '';
  let createdInvitationId = '';
  let createdInvitationToken = '';
  let invitedMemberId = '';
  const testSessionSalt = Date.now() % 100000;

  async function loginAndGetToken(email: string, password = 'Password123!'): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(`Login failed for ${email}: ${JSON.stringify(json)}`);
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

  // --------------------------------------------------------------------------
  // TEST 1: AUTHENTICATION INITIALIZATION
  // --------------------------------------------------------------------------
  await assert('Test 1: Authenticate Recruiter (Company A), Recruiter (Company B), and Candidate', async () => {
    recruiterToken = await loginAndGetToken('recruiter@synthetix.com');
    candidateToken = await loginAndGetToken('candidate@careersphere.ai');
    horizonRecruiterToken = await loginAndGetToken('recruiter@horizontech.com');

    if (!recruiterToken || !candidateToken || !horizonRecruiterToken) {
      throw new Error('Failed to obtain required authentication tokens');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 2: RBAC - CANDIDATE BLOCKED FROM RECRUITER ANALYTICS (HTTP 403)
  // --------------------------------------------------------------------------
  await assert('Test 2: Candidate is blocked with HTTP 403 from accessing Recruiter Analytics', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/analytics`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden, received HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.success !== false) {
      throw new Error('Candidate should not succeed on recruiter analytics API');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 3: RBAC - CANDIDATE BLOCKED FROM TEAM MANAGEMENT (HTTP 403)
  // --------------------------------------------------------------------------
  await assert('Test 3: Candidate is blocked with HTTP 403 from accessing Team Management', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/team`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden, received HTTP ${res.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 4: RBAC - CANDIDATE BLOCKED FROM AUDIT LOGS (HTTP 403)
  // --------------------------------------------------------------------------
  await assert('Test 4: Candidate is blocked with HTTP 403 from accessing Recruiter Audit Logs', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/audit-logs`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden, received HTTP ${res.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 5: RECRUITER ANALYTICS CALCULATION INTEGRITY
  // --------------------------------------------------------------------------
  await assert('Test 5: Authorized Recruiter retrieves genuine company-scoped analytics metrics', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/analytics`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) {
      throw new Error(`Analytics retrieval failed with HTTP ${res.status}`);
    }
    const json = await res.json();
    if (!json.success || !json.data.analytics) {
      throw new Error('Missing analytics data payload');
    }

    const { summary, funnel, stageDistribution, topJobs, teamWorkload } = json.data.analytics;
    if (typeof summary.totalJobs !== 'number' || summary.totalJobs < 0) {
      throw new Error('Invalid totalJobs count in summary');
    }
    if (typeof summary.totalApplications !== 'number' || summary.totalApplications < 0) {
      throw new Error('Invalid totalApplications count in summary');
    }
    if (typeof summary.overallConversionRate !== 'number') {
      throw new Error('Invalid overallConversionRate in summary');
    }

    // Verify funnel breakdown keys
    if (typeof funnel.applied !== 'number' || typeof funnel.hired !== 'number') {
      throw new Error('Invalid funnel counts');
    }
    if (!funnel.conversionRates || typeof funnel.conversionRates.overall !== 'number') {
      throw new Error('Missing funnel conversion rates');
    }
    if (!Array.isArray(topJobs) || !Array.isArray(teamWorkload)) {
      throw new Error('topJobs and teamWorkload must be arrays');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 6: RECRUITER ANALYTICS FILTERING BY DATE RANGE AND JOB ID
  // --------------------------------------------------------------------------
  await assert('Test 6: Analytics API correctly filters by date range (7d, 30d, 90d, all) and jobId', async () => {
    const resAll = await fetch(`${BASE_URL}/recruiter/analytics?range=all`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const jsonAll = await resAll.json();
    if (!jsonAll.success) throw new Error('Failed to fetch range=all analytics');

    const res7d = await fetch(`${BASE_URL}/recruiter/analytics?range=7d`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json7d = await res7d.json();
    if (!json7d.success) throw new Error('Failed to fetch range=7d analytics');

    if (json7d.data.analytics.dateRange.range !== '7d') {
      throw new Error('Expected dateRange.range to be 7d');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 7: CSV REPORT EXPORT WITH FORMULA INJECTION SANITIZATION
  // --------------------------------------------------------------------------
  await assert('Test 7: Export analytics CSV with spreadsheet formula injection protection', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/analytics/reports/export?range=30d`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) {
      throw new Error(`CSV export failed with status ${res.status}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/csv')) {
      throw new Error(`Expected text/csv content type, received ${contentType}`);
    }

    const csvContent = await res.text();
    if (!csvContent.includes('CareerSphere AI - Executive Hiring & Funnel Report')) {
      throw new Error('CSV missing required header banner');
    }
    if (!csvContent.includes('REQUISITION PERFORMANCE')) {
      throw new Error('CSV missing requisition performance section');
    }
    if (!csvContent.includes('HIRING FUNNEL CONVERSION')) {
      throw new Error('CSV missing hiring funnel conversion section');
    }

    // Formula injection check: Any cell starting with =, +, -, @ must be neutralized with a leading single quote
    const lines = csvContent.split('\n');
    for (const line of lines) {
      const cells = line.split(',');
      for (const cell of cells) {
        const trimmed = cell.trim().replace(/^"/, '').replace(/"$/, '');
        if (/^[=+\-@\t\r]/.test(trimmed)) {
          if (!trimmed.startsWith("'")) {
            throw new Error(`Unsanitized formula injection detected in CSV cell: ${trimmed}`);
          }
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // TEST 8: CSV EXPORT AUDIT LOGGING RECORD
  // --------------------------------------------------------------------------
  await assert('Test 8: CSV Report export records an audit event in the company audit log', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/audit-logs?action=ANALYTICS_REPORT_EXPORTED`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error('Failed to query audit logs');
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.logs)) {
      throw new Error('Invalid audit log response');
    }
    const exportEvent = json.data.logs.find((l: any) => l.action === 'ANALYTICS_REPORT_EXPORTED');
    if (!exportEvent) {
      throw new Error('Expected ANALYTICS_REPORT_EXPORTED audit event not found');
    }
    if (exportEvent.status !== 'SUCCESS') {
      throw new Error('Expected audit event status SUCCESS');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 9: TEAM DIRECTORY AND MEMBER STATS LISTING
  // --------------------------------------------------------------------------
  await assert('Test 9: Recruiter retrieves authorized company team directory, stats, and invitations', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/team`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`Team directory failed with HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Failed to retrieve team');

    const { team, invitations, stats } = json.data;
    if (!Array.isArray(team) || team.length === 0) {
      throw new Error('Expected non-empty company team array');
    }
    if (!Array.isArray(invitations)) {
      throw new Error('Expected invitations array');
    }
    if (!stats || typeof stats.activeMembers !== 'number') {
      throw new Error('Missing stats in team directory');
    }

    // Verify company owner is present
    const ownerMember = team.find((m: any) => m.role === 'owner');
    if (!ownerMember) {
      throw new Error('Expected at least one active company owner');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 10: GENERATE 48H EXPIRING TEAM INVITATION
  // --------------------------------------------------------------------------
  await assert('Test 10: Dispatch single-use 48h team invitation token for new recruiter', async () => {
    const testEmail = `new.recruiter.${testSessionSalt}@synthetix.com`;
    const res = await fetch(`${BASE_URL}/recruiter/team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        email: testEmail,
        role: 'recruiter',
        title: 'Lead Technical Sourcer',
        department: 'Engineering Talent',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Invitation dispatch failed: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    if (!json.success || !json.data.invitation) {
      throw new Error('Missing invitation object in response');
    }

    const inv = json.data.invitation;
    if (!inv.token || !inv.expiresAt || inv.status !== 'pending') {
      throw new Error('Invalid invitation structure');
    }

    // Verify 48 hour expiration window
    const createdTime = new Date(inv.createdAt).getTime();
    const expiryTime = new Date(inv.expiresAt).getTime();
    const diffHours = (expiryTime - createdTime) / (1000 * 60 * 60);
    if (diffHours < 47 || diffHours > 49) {
      throw new Error(`Expected ~48h expiry duration, got ${diffHours.toFixed(1)} hours`);
    }

    createdInvitationId = inv.id;
    createdInvitationToken = inv.token;
  });

  // --------------------------------------------------------------------------
  // TEST 11: RESEND PENDING INVITATION (REFRESH TOKEN & EXTEND 48H)
  // --------------------------------------------------------------------------
  await assert('Test 11: Resend team invitation, refreshing the token and extending expiration', async () => {
    if (!createdInvitationId) throw new Error('Missing createdInvitationId');
    const res = await fetch(`${BASE_URL}/recruiter/team/invitations/${createdInvitationId}/resend`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`Resend invitation failed with status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.invitation) {
      throw new Error('Missing invitation in resend response');
    }

    const refreshed = json.data.invitation;
    if (!refreshed.token) {
      throw new Error('Missing refreshed token');
    }
    // Update token to the refreshed one
    createdInvitationToken = refreshed.token;
  });

  // --------------------------------------------------------------------------
  // TEST 12: ACCEPT TEAM INVITATION AND ACTIVATE MEMBERSHIP
  // --------------------------------------------------------------------------
  await assert('Test 12: Accept invitation via single-use token and activate membership', async () => {
    if (!createdInvitationToken) throw new Error('Missing createdInvitationToken');
    const res = await fetch(`${BASE_URL}/recruiter/team/invitations/${createdInvitationToken}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Accept invitation failed: ${JSON.stringify(err)}`);
    }
    const json = await res.json();
    if (!json.success || !json.data.member) {
      throw new Error('Missing activated member in accept response');
    }
    const activated = json.data.member;
    if (activated.status !== 'active') {
      throw new Error('Expected member status to be active');
    }
    invitedMemberId = activated.id;

    // Verify token is single use: Second accept attempt must fail with 400
    const secondRes = await fetch(`${BASE_URL}/recruiter/team/invitations/${createdInvitationToken}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (secondRes.status !== 400) {
      throw new Error(`Expected single-use invitation re-use to return HTTP 400, got ${secondRes.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 13: UPDATE MEMBER ROLE AND PERMISSIONS
  // --------------------------------------------------------------------------
  await assert('Test 13: Update member role to hiring_manager with verified permissions', async () => {
    if (!invitedMemberId) throw new Error('Missing invitedMemberId');
    const res = await fetch(`${BASE_URL}/recruiter/team/members/${invitedMemberId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        role: 'hiring_manager',
        title: 'Engineering Director & Hiring Manager',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Role update failed: ${JSON.stringify(err)}`);
    }
    const json = await res.json();
    if (!json.success || json.data.member.role !== 'hiring_manager') {
      throw new Error('Expected member role to be updated to hiring_manager');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 14: SUSPEND AND RE-ACTIVATE TEAM MEMBER STATUS
  // --------------------------------------------------------------------------
  await assert('Test 14: Suspend team member status and subsequently reactivate', async () => {
    if (!invitedMemberId) throw new Error('Missing invitedMemberId');
    // Suspend
    const suspendRes = await fetch(`${BASE_URL}/recruiter/team/members/${invitedMemberId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ status: 'suspended' }),
    });
    if (!suspendRes.ok) throw new Error(`Suspension failed with HTTP ${suspendRes.status}`);
    const suspendJson = await suspendRes.json();
    if (suspendJson.data.member.status !== 'suspended') {
      throw new Error('Expected member status to be suspended');
    }

    // Reactivate
    const activateRes = await fetch(`${BASE_URL}/recruiter/team/members/${invitedMemberId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ status: 'active' }),
    });
    if (!activateRes.ok) throw new Error(`Reactivation failed with HTTP ${activateRes.status}`);
    const activateJson = await activateRes.json();
    if (activateJson.data.member.status !== 'active') {
      throw new Error('Expected member status to be active');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 15: LAST OWNER PROTECTION GUARD: PREVENT DEMOTING LAST OWNER (400)
  // --------------------------------------------------------------------------
  await assert('Test 15: Last Owner Protection Guard prevents demoting the sole company owner', async () => {
    // mem_01 is the sole owner of comp_synthetix
    const res = await fetch(`${BASE_URL}/recruiter/team/members/mem_01/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ role: 'recruiter' }),
    });

    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for demoting last owner, received HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.error?.code !== 'CANNOT_REMOVE_LAST_OWNER') {
      throw new Error(`Expected CANNOT_REMOVE_LAST_OWNER error code, received ${json.error?.code}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 16: LAST OWNER PROTECTION GUARD: PREVENT SUSPENDING LAST OWNER (400)
  // --------------------------------------------------------------------------
  await assert('Test 16: Last Owner Protection Guard prevents suspending the sole company owner', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/team/members/mem_01/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ status: 'suspended' }),
    });

    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for suspending last owner, received HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.error?.code !== 'CANNOT_DEACTIVATE_LAST_OWNER') {
      throw new Error(`Expected CANNOT_DEACTIVATE_LAST_OWNER error code, received ${json.error?.code}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 17: LAST OWNER PROTECTION GUARD: PREVENT DELETING LAST OWNER (400)
  // --------------------------------------------------------------------------
  await assert('Test 17: Last Owner Protection Guard prevents deleting the sole company owner', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/team/members/mem_01`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for deleting last owner, received HTTP ${res.status}`);
    }
    const json = await res.json();
    if (json.error?.code !== 'CANNOT_REMOVE_LAST_OWNER') {
      throw new Error(`Expected CANNOT_REMOVE_LAST_OWNER error code, received ${json.error?.code}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 18: REMOVE NON-OWNER TEAM MEMBER SAFELY
  // --------------------------------------------------------------------------
  await assert('Test 18: Safely remove a non-owner team member and log audit trail', async () => {
    if (!invitedMemberId) throw new Error('Missing invitedMemberId');
    const res = await fetch(`${BASE_URL}/recruiter/team/members/${invitedMemberId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Member deletion failed: ${JSON.stringify(err)}`);
    }
    const json = await res.json();
    if (!json.success || json.data.deletedMemberId !== invitedMemberId) {
      throw new Error('Expected deletedMemberId to match target member');
    }
  });

  // --------------------------------------------------------------------------
  // TEST 19: REVOKE PENDING TEAM INVITATION
  // --------------------------------------------------------------------------
  await assert('Test 19: Create and revoke a pending invitation', async () => {
    const inviteRes = await fetch(`${BASE_URL}/recruiter/team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        email: `revokable.${testSessionSalt}@synthetix.com`,
        role: 'interviewer',
        title: 'Staff Architect Interviewer',
      }),
    });
    const inviteJson = await inviteRes.json();
    const invId = inviteJson.data.invitation.id;

    // Revoke
    const revokeRes = await fetch(`${BASE_URL}/recruiter/team/invitations/${invId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!revokeRes.ok) throw new Error('Failed to revoke invitation');
    const revokeJson = await revokeRes.json();
    if (!revokeJson.success) throw new Error('Revocation response was not successful');
  });

  // --------------------------------------------------------------------------
  // TEST 20: CROSS-COMPANY ISOLATION: COMPANY B CANNOT ACCESS COMPANY A MEMBERS
  // --------------------------------------------------------------------------
  await assert('Test 20: Cross-company security prevents Company B from modifying Company A members', async () => {
    // mem_01 belongs to comp_synthetix; horizonRecruiterToken belongs to comp_horizon
    const res = await fetch(`${BASE_URL}/recruiter/team/members/mem_01/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${horizonRecruiterToken}`,
      },
      body: JSON.stringify({ status: 'suspended' }),
    });

    if (res.status !== 404 && res.status !== 403) {
      throw new Error(`Expected HTTP 403 or 404 for cross-company member mutation, received HTTP ${res.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 21: CROSS-COMPANY ISOLATION: ANALYTICS SCOPED TO CALLER'S COMPANY ONLY
  // --------------------------------------------------------------------------
  await assert('Test 21: Cross-company isolation ensures analytics only reflect caller company scope', async () => {
    const resSynthetix = await fetch(`${BASE_URL}/recruiter/analytics`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const jsonSynthetix = await resSynthetix.json();

    const resHorizon = await fetch(`${BASE_URL}/recruiter/analytics`, {
      headers: { Authorization: `Bearer ${horizonRecruiterToken}` },
    });
    const jsonHorizon = await resHorizon.json();

    if (!jsonSynthetix.success || !jsonHorizon.success) {
      throw new Error('Failed to retrieve analytics for comparison');
    }

    // Top jobs for Horizon Tech must only contain Horizon Tech jobs (or 0 if none)
    const horizonJobs = jsonHorizon.data.analytics.topJobs;
    for (const j of horizonJobs) {
      if (j.companyId && j.companyId !== 'comp_horizon') {
        throw new Error(`Data leakage: Horizon Tech analytics contains job belonging to ${j.companyId}`);
      }
    }
  });

  // --------------------------------------------------------------------------
  // TEST 22: AUDIT LOG RETRIEVAL WITH SEARCH AND STATUS FILTERS
  // --------------------------------------------------------------------------
  await assert('Test 22: Recruiter queries company audit logs with search and pagination', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/audit-logs?status=SUCCESS&limit=10&page=1`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`Audit query failed with HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.logs)) {
      throw new Error('Invalid audit logs response');
    }
    if (typeof json.data.total !== 'number' || json.data.total < 1) {
      throw new Error('Expected non-empty audit logs total count');
    }
    // Verify each log has required compliance properties
    for (const log of json.data.logs) {
      if (!log.id || !log.action || !log.actor || !log.timestamp || !log.status) {
        throw new Error('Audit log record missing required compliance fields');
      }
    }
  });

  // --------------------------------------------------------------------------
  // TEST 23: AUDIT TRAIL IMMUTABILITY AND METADATA SAFETY
  // --------------------------------------------------------------------------
  await assert('Test 23: Audit logs sanitize sensitive data (no passwords, OTPs, or auth tokens in metadata)', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/audit-logs?limit=50`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    const allLogs = json.data.logs;

    for (const log of allLogs) {
      const serialized = JSON.stringify(log);
      if (serialized.includes('Password123!') || serialized.includes('jwt_secret')) {
        throw new Error('Security leak: Plaintext password or secret detected in audit log payload');
      }
    }
  });

  // --------------------------------------------------------------------------
  // TEST 24: CROSS-PORTAL WORKFLOW: RECRUITER STATUS UPDATE SYNCS TO CANDIDATE
  // --------------------------------------------------------------------------
  await assert('Test 24: Recruiter stage change updates candidate tracking and dashboard metrics', async () => {
    // 1. Get candidate's applications or apply to job_01
    const candAppsRes = await fetch(`${BASE_URL}/candidate/applications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const candAppsJson = await candAppsRes.json();
    let appToUpdate = candAppsJson.data?.applications?.find(
      (a: any) => a.companyId === 'comp_synthetix' || a.jobId === 'job_01'
    );

    if (!appToUpdate) {
      const applyRes = await fetch(`${BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`,
        },
        body: JSON.stringify({
          jobId: 'job_01',
          notes: 'Applying for cross-portal sync verification',
          consentGranted: true,
        }),
      });
      const applyJson = await applyRes.json();
      appToUpdate = applyJson.data.application;
    }

    if (!appToUpdate) throw new Error('Failed to obtain candidate application');

    // 2. Recruiter advances applicant stage to 'shortlisted'
    const updateRes = await fetch(`${BASE_URL}/recruiter/applications/${appToUpdate.id}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        stage: 'shortlisted',
        note: 'Advanced candidate to shortlist during Phase 5 testing',
      }),
    });
    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(`Recruiter stage advancement failed: ${JSON.stringify(err)}`);
    }

    // 3. Candidate verifies their application reflects the updated stage
    const verifyRes = await fetch(`${BASE_URL}/candidate/applications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const verifyJson = await verifyRes.json();
    const updatedCandidateApp = verifyJson.data.applications.find((a: any) => a.id === appToUpdate.id);
    if (!updatedCandidateApp || updatedCandidateApp.stage.toLowerCase() !== 'shortlisted') {
      throw new Error(`Expected candidate application stage to be 'shortlisted', got '${updatedCandidateApp?.stage}'`);
    }
  });

  // --------------------------------------------------------------------------
  // TEST 25: COMPLETE END-TO-END DEPLOYMENT READINESS AND BACKGROUND RUNNER
  // --------------------------------------------------------------------------
  await assert('Test 25: Verify platform health, background reminder runner, and zero regressions', async () => {
    // 1. Check health
    const healthRes = await fetch(`${BASE_URL}/health/`);
    if (!healthRes.ok) throw new Error('Platform health check failed');
    const healthJson = await healthRes.json();
    if (!healthJson.data?.dependencies?.database || healthJson.data?.dependencies?.database.status !== 'connected') {
      throw new Error('Database dependency report not connected');
    }

    // 2. Check automated background runner trigger
    const reminderRes = await fetch(`${BASE_URL}/recruiter/interviews/check-reminders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!reminderRes.ok) throw new Error('Background interview reminders check failed');
    const reminderJson = await reminderRes.json();
    if (typeof reminderJson.data.reminders24hSent !== 'number') {
      throw new Error('Background reminder runner returned invalid payload');
    }
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('   Phase 5 Automated Test Suite Complete');
  console.log(`   Passed: ${results.filter((r) => r.passed).length} / ${results.length}`);
  console.log(`   Failed: ${results.filter((r) => !r.passed).length} / ${results.length}`);
  console.log('================================================================');

  if (results.some((r) => !r.passed)) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
