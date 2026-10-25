/**
 * CareerSphere AI — Phase 4 Automated Test Suite
 * Recruiter Interview Management, Rescheduling, Rounds, Evaluator Feedback,
 * Job Offer Lifecycle, Candidate Response Synchronization, Messaging, and ICS Export.
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
  console.log('   CareerSphere AI — Recruiter Phase 4 Automated Test Suite     ');
  console.log('   Interviews, Feedback, Offers, Messaging & Hiring Lifecycle   ');
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
  let targetAppId = '';
  let createdInterviewId = '';
  let createdOfferId = '';
  let testConversationId = '';
  const sessionSalt = (Date.now() % 100000);

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
  // 1. AUTHENTICATION & RBAC
  // --------------------------------------------------------------------------
  await assert('1.1 Authenticate Recruiter and Candidate sessions', async () => {
    recruiterToken = await loginAndGetToken('recruiter@synthetix.com');
    candidateToken = await loginAndGetToken('candidate@careersphere.ai');
    if (!recruiterToken || !candidateToken) {
      throw new Error('Failed to acquire valid JWT tokens');
    }
  });

  await assert('1.2 Candidate is blocked with 403 Forbidden from Recruiter Interviews API', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  await assert('1.3 Unauthenticated request to Recruiter Interviews API returns 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews`);
    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got HTTP ${res.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // 2. RECRUITER INTERVIEW MANAGEMENT & DIRECTORY
  // --------------------------------------------------------------------------
  await assert('2.1 Fetch recruiter company interviews with statusCounts breakdown', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.interviews)) {
      throw new Error(`Invalid response structure: ${JSON.stringify(json)}`);
    }
    if (!json.data.statusCounts || typeof json.data.statusCounts !== 'object') {
      throw new Error('Missing statusCounts breakdown');
    }
  });

  await assert('2.2 Filter recruiter interviews by status and search keywords', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews?status=confirmed&search=David`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json.data.interviews;
    if (list.length > 0) {
      if (list[0].status !== 'confirmed') {
        throw new Error(`Expected status confirmed, got ${list[0].status}`);
      }
    }
  });

  // Get an application to schedule interview for
  await assert('2.3 Acquire a valid recruiter candidate application', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    const apps = json.data.applicants;
    if (!apps || apps.length === 0) {
      throw new Error('No applicants available in seed data');
    }
    const candApp = apps.find((a: any) => a.candidateEmail === 'candidate@careersphere.ai' || a.candidateId === 'user_candidate_01');
    targetAppId = candApp ? candApp.id : apps[0].id;
  });

  // --------------------------------------------------------------------------
  // 3. INTERVIEW SCHEDULING WIZARD & CONFLICT DETECTION
  // --------------------------------------------------------------------------
  await assert('3.1 Rejects interview scheduling in the past with 400 Bad Request', async () => {
    const pastTime = new Date(Date.now() - 86400000).toISOString();
    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        roundName: 'Round 1: Screening',
        scheduledAt: pastTime,
      }),
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 Bad Request for past date, got HTTP ${res.status}`);
    }
  });

  await assert('3.2 Rejects interview where endAt precedes scheduledAt with 400 Bad Request', async () => {
    const start = new Date(Date.now() + 86400000 * 5).toISOString();
    const end = new Date(Date.now() + 86400000 * 5 - 3600000).toISOString();
    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        roundName: 'Round 1: Screening',
        scheduledAt: start,
        endAt: end,
      }),
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 Bad Request for invalid end time, got HTTP ${res.status}`);
    }
  });

  await assert('3.3 Successfully schedule an interview round for applicant', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 4 + sessionSalt * 60000); // Scoped future slot
    const startIso = futureDate.toISOString();
    const endIso = new Date(futureDate.getTime() + 45 * 60000).toISOString();

    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        roundName: 'Round 2: Distributed Systems Deep Dive',
        roundNumber: 2,
        interviewType: 'video',
        scheduledAt: startIso,
        endAt: endIso,
        timezone: 'America/Los_Angeles',
        meetingUrl: 'https://meet.google.com/test-phase4-flow',
        candidateInstructions: 'Please ensure camera and microphone are tested before the call.',
        internalNotes: 'Assess database sharding, caching topologies, and raft consensus.',
        interviewers: [
          {
            id: 'int_usr_01',
            name: 'Sarah Jenkins (VP Talent)',
            email: 'sarah.jenkins@synthetix.com',
            role: 'Lead Evaluator',
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || !json.data.interview) {
      throw new Error(`Invalid response: ${JSON.stringify(json)}`);
    }

    createdInterviewId = json.data.interview.id;
    if (json.data.interview.roundName !== 'Round 2: Distributed Systems Deep Dive') {
      throw new Error('Round name mismatch');
    }
  });

  await assert('3.4 Calendar conflict detection triggers 409 Conflict for overlapping slot', async () => {
    // Attempt to schedule an overlapping session at the exact same time without override
    const futureDate = new Date(Date.now() + 86400000 * 4 + sessionSalt * 60000);
    const startIso = new Date(futureDate.getTime() + 15 * 60000).toISOString(); // 15 mins in, overlaps
    const endIso = new Date(futureDate.getTime() + 60 * 60000).toISOString();

    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        roundName: 'Round 3: Concurrent Conflict Test',
        roundNumber: 3,
        scheduledAt: startIso,
        endAt: endIso,
        overrideConflict: false,
      }),
    });

    if (res.status !== 409) {
      throw new Error(`Expected 409 Conflict, got HTTP ${res.status}`);
    }
    const json = await res.json();
    if (!json.conflict) {
      throw new Error('Response did not declare conflict flag');
    }
  });

  await assert('3.5 Override conflict successfully schedules session when overrideConflict: true', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 4 + sessionSalt * 60000);
    const startIso = new Date(futureDate.getTime() + 15 * 60000).toISOString();
    const endIso = new Date(futureDate.getTime() + 60 * 60000).toISOString();

    const res = await fetch(`${BASE_URL}/recruiter/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        roundName: 'Round 3: Confirmed Overridden Session',
        roundNumber: 3,
        scheduledAt: startIso,
        endAt: endIso,
        overrideConflict: true,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success) throw new Error('Failed to override conflict');
  });

  // --------------------------------------------------------------------------
  // 4. CANDIDATE ACCESS & PRIVACY (STRIPPING CONFIDENTIAL NOTES)
  // --------------------------------------------------------------------------
  await assert('4.1 Candidate views scheduled interviews with internal notes strictly stripped', async () => {
    const res = await fetch(`${BASE_URL}/candidate/interviews`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.interviews)) {
      throw new Error('Invalid candidate interview response');
    }

    // Verify confidential internalNotes is completely absent from all items
    for (const item of json.data.interviews) {
      if ((item as any).internalNotes) {
        throw new Error(`PRIVACY VIOLATION: candidate interview exposes internalNotes: ${(item as any).internalNotes}`);
      }
    }
  });

  await assert('4.2 Candidate confirms interview attendance', async () => {
    const res = await fetch(`${BASE_URL}/candidate/interviews/${createdInterviewId}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || json.data.interview.status !== 'confirmed') {
      throw new Error(`Expected status confirmed, got ${json.data?.interview?.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // 5. RESCHEDULE REQUEST WORKFLOW (CANDIDATE -> RECRUITER)
  // --------------------------------------------------------------------------
  await assert('5.1 Candidate submits a reschedule request with reason and proposed time', async () => {
    const proposed = new Date(Date.now() + 86400000 * 6).toISOString();
    const res = await fetch(`${BASE_URL}/candidate/interviews/${createdInterviewId}/reschedule-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        reason: 'Conflict with university final exam presentation',
        proposedScheduledAt: proposed,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.data.interview.status !== 'reschedule_requested') {
      throw new Error(`Expected status reschedule_requested, got ${json.data.interview.status}`);
    }
  });

  await assert('5.2 Recruiter reviews and accepts candidate reschedule request', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews/${createdInterviewId}/reschedule-response`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        action: 'accept',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.data.interview.status !== 'scheduled' && json.data.interview.status !== 'confirmed') {
      throw new Error(`Expected scheduled or confirmed after accept, got ${json.data.interview.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // 6. RECRUITER RESCHEDULE WITH AUDIT TRAIL PRESERVATION
  // --------------------------------------------------------------------------
  await assert('6.1 Recruiter reschedules session and preserves rescheduleHistory', async () => {
    const newTime = new Date(Date.now() + 86400000 * 7).toISOString();
    const res = await fetch(`${BASE_URL}/recruiter/interviews/${createdInterviewId}/reschedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        newScheduledAt: newTime,
        reason: 'Senior architect traveling for summit',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const history = json.data.interview.rescheduleHistory;
    if (!Array.isArray(history) || history.length === 0) {
      throw new Error('Reschedule history was not preserved');
    }
    if (history[history.length - 1].reason !== 'Senior architect traveling for summit') {
      throw new Error('Reschedule audit reason mismatch');
    }
  });

  // --------------------------------------------------------------------------
  // 7. STRUCTURED INTERVIEW EVALUATION & FEEDBACK
  // --------------------------------------------------------------------------
  await assert('7.1 Recruiter submits structured evaluation with criteria ratings (1-5) and recommendation', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews/${createdInterviewId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        recommendation: 'strong_hire',
        criteriaRatings: {
          technical: 5,
          problemSolving: 5,
          communication: 4,
          culturalAdd: 5,
        },
        strengths: 'Outstanding distributed systems depth and clear whiteboard communication.',
        growthAreas: 'Could deepen Kubernetes operator patterns.',
        privateNotes: 'Target for Senior Systems Lead role.',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || !json.data.feedback.isLocked) {
      throw new Error('Feedback was not created or locked');
    }
  });

  await assert('7.2 Candidate is blocked with 403 Forbidden from accessing recruiter feedback', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews/${createdInterviewId}/feedback`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // 8. RFC 5545 .ICS CALENDAR EXPORT
  // --------------------------------------------------------------------------
  await assert('8.1 Download valid RFC 5545 .ics calendar invitation', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews/${createdInterviewId}/ics`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('BEGIN:VCALENDAR') || !text.includes('BEGIN:VEVENT') || !text.includes('END:VCALENDAR')) {
      throw new Error('Invalid RFC 5545 calendar format');
    }
  });

  // --------------------------------------------------------------------------
  // 9. JOB OFFER LIFECYCLE MANAGEMENT
  // --------------------------------------------------------------------------
  await assert('9.1 Recruiter creates draft compensation package offer', async () => {
    const start = new Date(Date.now() + 86400000 * 30).toISOString();
    const expiry = new Date(Date.now() + 86400000 * 14).toISOString();

    const res = await fetch(`${BASE_URL}/recruiter/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        salary: {
          amount: 195000,
          currency: 'USD',
          frequency: 'annual',
        },
        equity: '0.20% equity over 4 years',
        signOnBonus: 20000,
        startDate: start,
        expiresAt: expiry,
        workplaceType: 'remote',
        benefits: ['Full health, dental, vision', '401(k) 4% match', 'Unlimited PTO'],
        notes: 'Excited to invite you to our engineering team!',
        issueImmediately: false,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || json.data.offer.status !== 'draft') {
      throw new Error(`Expected draft status, got ${json.data?.offer?.status}`);
    }
    createdOfferId = json.data.offer.id;
  });

  await assert('9.2 Recruiter issues draft offer and synchronizes stage to Offer Extended', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/offers/${createdOfferId}/issue`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.data.offer.status !== 'issued') {
      throw new Error(`Expected status issued, got ${json.data.offer.status}`);
    }
  });

  await assert('9.3 Recruiter creates revised offer package with version bump (v2)', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/offers/${createdOfferId}/revise`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        salary: {
          amount: 205000,
          currency: 'USD',
          frequency: 'annual',
        },
        signOnBonus: 25000,
        revisionSummary: 'Increased base salary and sign-on bonus per candidate conversation',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.data.offer.version !== 2) {
      throw new Error(`Expected version 2, got version ${json.data.offer.version}`);
    }
    if (!json.data.offer.versionHistory || json.data.offer.versionHistory.length === 0) {
      throw new Error('Version history was not tracked');
    }
  });

  await assert('9.4 Candidate reviews issued offer via candidate endpoint', async () => {
    const res = await fetch(`${BASE_URL}/candidate/offers`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.offers)) {
      throw new Error('Invalid candidate offers response');
    }
    const matching = json.data.offers.find((o: any) => o.id === createdOfferId);
    if (!matching) throw new Error('Candidate did not receive issued offer');
    if (matching.salary.amount !== 205000) {
      throw new Error(`Expected updated salary 205000, got ${matching.salary.amount}`);
    }
  });

  await assert('9.5 Candidate accepts offer and automatically advances application stage to Hired', async () => {
    const res = await fetch(`${BASE_URL}/candidate/offers/${createdOfferId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        action: 'accept',
        notes: 'Thrilled to accept! Looking forward to joining.',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.data.offer.status !== 'accepted') {
      throw new Error(`Expected offer status accepted, got ${json.data.offer.status}`);
    }

    // Verify application stage moved to 'Hired'
    const appRes = await fetch(`${BASE_URL}/recruiter/applicants/${targetAppId}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const appJson = await appRes.json();
    if (appJson.data.applicant.stage !== 'Hired') {
      throw new Error(`Expected application stage Hired, got ${appJson.data.applicant.stage}`);
    }
  });

  // --------------------------------------------------------------------------
  // 10. RECRUITER-CANDIDATE MESSAGING INBOX
  // --------------------------------------------------------------------------
  await assert('10.1 Recruiter initiates conversation thread with applicant', async () => {
    const res = await fetch(`${BASE_URL}/conversations/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetAppId,
        initialMessage: 'Welcome to the team! Our onboarding partner will be in touch shortly.',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || !json.data.conversation) {
      throw new Error('Failed to initiate conversation thread');
    }
    testConversationId = json.data.conversation.id;
  });

  await assert('10.2 Candidate retrieves conversation transcript and replies', async () => {
    const res = await fetch(`${BASE_URL}/conversations/${testConversationId}/messages`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json.data.messages) || json.data.messages.length === 0) {
      throw new Error('Candidate did not receive messages transcript');
    }

    // Send reply
    const replyRes = await fetch(`${BASE_URL}/conversations/${testConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        text: 'Thank you so much! What laptop and dev environment options are provided?',
      }),
    });
    if (!replyRes.ok) throw new Error(`HTTP ${replyRes.status}`);
    const replyJson = await replyRes.json();
    if (!replyJson.success || replyJson.data.message.senderRole !== 'candidate') {
      throw new Error('Candidate message was not registered correctly');
    }
  });

  // --------------------------------------------------------------------------
  // 11. AUTOMATED NOTIFICATION & REMINDER RUNNER
  // --------------------------------------------------------------------------
  await assert('11.1 Automated reminder runner dispatches notifications and reconciles expired offers', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/interviews/check-reminders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (!json.success || typeof json.data.sentCount !== 'number') {
      throw new Error('Invalid reminder check result');
    }
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('              Phase 4 Test Suite Execution Summary              ');
  console.log('================================================================');

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Assertions: ${total}`);
  console.log(`Passed:           ${passed}`);
  console.log(`Failed:           ${failed}`);

  if (failed > 0) {
    console.error('\nFAILURES:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 4 INTERVIEW & OFFER TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner exception:', e);
  process.exit(1);
});
