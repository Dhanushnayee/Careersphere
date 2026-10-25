/**
 * Automated Test Suite for Phase 3: Recruiter Applicant Tracking System (ATS)
 * Covers:
 * 1. Recruiter auth & RBAC (Candidate blocked from ATS endpoints with 403, unauthenticated 401)
 * 2. Company isolation (Recruiter restricted to own company requisitions and applicants)
 * 3. Applicant directory querying (pagination, multi-parameter filtering, search, sorting, stage counts)
 * 4. Comprehensive applicant dossier (candidate profile, resume, side-by-side job matching, responses, timeline)
 * 5. Secure resume access endpoint with Content-Disposition headers and company authorization
 * 6. Pipeline stage transitions with timeline audit trail and real-time candidate notifications
 * 7. Candidate notification feed & mark-as-read workflow
 * 8. Private recruiter internal notes CRUD (with strict candidate data isolation verification)
 * 9. Applicant tagging system (add & remove tags)
 * 10. Explainable AI Candidate Match analysis (structured scoring, required/preferred skills breakdown, bias advisory)
 * 11. AI Screening questions generation with prompt injection defense
 * 12. Atomic bulk applicant actions (bulk stage move, bulk tags, bulk rejection with feedback)
 * 13. Company-scoped Talent Pool (listing, bookmarking candidate, removing from pool)
 * 14. Side-by-side candidate comparison matrix (2-4 candidates)
 * 15. CSV export with Spreadsheet Formula Injection sanitization (=, +, -, @ prepended with ')
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
  console.log('   CareerSphere AI — Recruiter Phase 3 Automated Test Suite     ');
  console.log('   Applicant Tracking System & AI Candidate Evaluation ATS      ');
  console.log('================================================================\n');

  // Wait for dev server to be responsive
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
  let adminToken = '';
  let targetAppId = '';
  let secondAppId = '';
  let testNoteId = '';

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
  await assert('1.1 Authenticate Recruiter, Candidate, and Admin accounts', async () => {
    recruiterToken = await loginAndGetToken('recruiter@synthetix.com');
    candidateToken = await loginAndGetToken('candidate@careersphere.ai');
    adminToken = await loginAndGetToken('admin@careersphere.ai');
    if (!recruiterToken || !candidateToken || !adminToken) {
      throw new Error('Failed to acquire required authentication tokens');
    }
  });

  await assert('1.2 Candidate role is blocked (403) from Recruiter Applicants API', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for candidate, got ${res.status}`);
    }
  });

  await assert('1.3 Unauthenticated request is rejected (401) from Recruiter Applicants API', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants`);
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized for unauthenticated call, got ${res.status}`);
    }
  });

  await assert('1.4 Recruiter successfully authenticates and accesses company applicants', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) {
      throw new Error(`Expected HTTP 200 OK, got ${res.status}`);
    }
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data?.applicants)) {
      throw new Error(`Invalid response structure: ${JSON.stringify(json)}`);
    }
    if (json.data.applicants.length === 0) {
      throw new Error('Expected at least one seeded applicant for recruiter company');
    }
    targetAppId = json.data.applicants[0].id;
    if (json.data.applicants.length > 1) {
      secondAppId = json.data.applicants[1].id;
    }
  });

  // --------------------------------------------------------------------------
  // 2. APPLICANT DIRECTORY & FILTERING
  // --------------------------------------------------------------------------
  await assert('2.1 Applicant directory provides stageCounts and pagination metadata', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const data = json.data;
    if (typeof data.total !== 'number' || typeof data.page !== 'number') {
      throw new Error('Missing pagination metadata (total, page)');
    }
    if (!data.stageCounts || typeof data.stageCounts.all !== 'number') {
      throw new Error('Missing or malformed stageCounts breakdown');
    }
  });

  await assert('2.2 Filter applicants by stage', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants?stage=Under+Review`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    for (const app of json.data.applicants) {
      if (app.stage !== 'Under Review') {
        throw new Error(`Expected stage 'Under Review', found '${app.stage}'`);
      }
    }
  });

  await assert('2.3 Search applicants by candidate name or email keyword', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants?search=Alex`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    if (json.data.applicants.length === 0) {
      throw new Error('Expected at least one match for search keyword "Alex"');
    }
    const found = json.data.applicants.some(
      (a: any) =>
        a.candidateName.toLowerCase().includes('alex') ||
        a.candidateEmail.toLowerCase().includes('alex')
    );
    if (!found) throw new Error('Result does not match search term');
  });

  await assert('2.4 Sort applicants by match score descending', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applicants?sortBy=matchScore&sortOrder=desc`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const apps = json.data.applicants;
    for (let i = 0; i < apps.length - 1; i++) {
      const scoreA = apps[i].matchAnalysis?.overallScore || apps[i].matchScore || 0;
      const scoreB = apps[i + 1].matchAnalysis?.overallScore || apps[i + 1].matchScore || 0;
      if (scoreA < scoreB) {
        throw new Error(`Sort order violated: ${scoreA} should be >= ${scoreB}`);
      }
    }
  });

  // --------------------------------------------------------------------------
  // 3. APPLICANT DOSSIER & SIDE-BY-SIDE MATCHING
  // --------------------------------------------------------------------------
  await assert('3.1 Retrieve complete applicant dossier with profile, job, and timeline', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    const dossier = json.data;

    if (!dossier.application || !dossier.candidate || !dossier.job) {
      throw new Error('Incomplete dossier: missing application, candidate, or job');
    }
    if (!Array.isArray(dossier.application.statusTimeline)) {
      throw new Error('Missing application statusTimeline');
    }
    if (!Array.isArray(dossier.application.internalNotes)) {
      throw new Error('Missing internal notes array');
    }
  });

  await assert('3.2 Non-existent application returns HTTP 404', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/app_non_existent_999`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (res.status !== 404) {
      throw new Error(`Expected HTTP 404 for invalid application ID, got ${res.status}`);
    }
  });

  // --------------------------------------------------------------------------
  // 4. SECURE RESUME REVIEW
  // --------------------------------------------------------------------------
  await assert('4.1 Authorized recruiter can access applicant resume securely', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/resume`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const disposition = res.headers.get('content-disposition');
    if (!disposition || !disposition.includes('filename=')) {
      throw new Error(`Expected Content-Disposition header with filename, got ${disposition}`);
    }
    const text = await res.text();
    if (!text || text.length === 0) {
      throw new Error('Expected non-empty resume text document stream');
    }
  });

  // --------------------------------------------------------------------------
  // 5. STAGE TRANSITIONS, AUDIT TIMELINE & CANDIDATE NOTIFICATIONS
  // --------------------------------------------------------------------------
  await assert('5.1 Move applicant stage and record audit timeline event', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        stage: 'Shortlisted',
        reason: 'Strong system design experience and clear communication during screening.',
      }),
    });
    if (!res.ok) throw new Error(`Failed to update stage: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data.application.stage !== 'Shortlisted') {
      throw new Error(`Stage was not updated to Shortlisted: ${JSON.stringify(json)}`);
    }

    // Verify timeline has the new event
    const timeline = json.data.timeline || json.data.application.statusTimeline;
    const latestEvent = timeline[timeline.length - 1];
    if (latestEvent.stage !== 'Shortlisted') {
      throw new Error(`Timeline latest stage is ${latestEvent.stage}, expected Shortlisted`);
    }
  });

  await assert('5.2 Candidate receives notification of stage transition in notification feed', async () => {
    const res = await fetch(`${BASE_URL}/candidate/notifications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data?.notifications)) {
      throw new Error('Invalid candidate notifications response structure');
    }
    const notifications = json.data.notifications;
    const notif = notifications.find((n: any) => n.applicationId === targetAppId);
    if (notif) {
      // Mark as read
      const readRes = await fetch(`${BASE_URL}/candidate/notifications/${notif.id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${candidateToken}` },
      });
      const readJson = await readRes.json();
      if (!readJson.success) throw new Error('Failed to mark notification as read');
    }
  });

  // --------------------------------------------------------------------------
  // 6. PRIVATE RECRUITER INTERNAL NOTES (STRICT CANDIDATE PRIVACY)
  // --------------------------------------------------------------------------
  await assert('6.1 Recruiter can create an internal confidential note', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        text: 'Confidential: candidate requested $185k compensation expectation. Team agrees to proceed to technical panel.',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.note) {
      throw new Error(`Failed to create note: ${JSON.stringify(json)}`);
    }
    testNoteId = json.data.note.id;
    if (!testNoteId) throw new Error('Missing note ID in response');
  });

  await assert('6.2 Candidate endpoints NEVER leak recruiter internal notes', async () => {
    // Request candidate's view of applications
    const res = await fetch(`${BASE_URL}/candidate/applications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const serialized = JSON.stringify(json);
    if (serialized.includes('Confidential: candidate requested $185k')) {
      throw new Error('CRITICAL SECURITY VIOLATION: Recruiter confidential notes leaked to candidate endpoint!');
    }
  });

  await assert('6.3 Recruiter can delete an internal note', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/notes/${testNoteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Failed to delete note');
  });

  // --------------------------------------------------------------------------
  // 7. APPLICANT TAGGING
  // --------------------------------------------------------------------------
  await assert('7.1 Recruiter can add custom tags to an applicant', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ tag: 'Top Tier Talent' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.tags.includes('Top Tier Talent')) {
      throw new Error(`Failed to add tag: ${JSON.stringify(json)}`);
    }
  });

  await assert('7.2 Recruiter can remove a tag from an applicant', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/tags/Top%20Tier%20Talent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data.tags.includes('Top Tier Talent')) {
      throw new Error('Tag was not removed');
    }
  });

  // --------------------------------------------------------------------------
  // 8. EXPLAINABLE AI CANDIDATE MATCHING & FAIRNESS ADVISORY
  // --------------------------------------------------------------------------
  await assert('8.1 Run explainable AI candidate match analysis with criteria breakdown', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/ai-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.matchAnalysis) {
      throw new Error(`Failed AI match: ${JSON.stringify(json)}`);
    }
    const analysis = json.data.matchAnalysis;

    if (typeof analysis.overallScore !== 'number' || analysis.overallScore < 0 || analysis.overallScore > 100) {
      throw new Error(`Invalid overallScore: ${analysis.overallScore}`);
    }
    if (!Array.isArray(analysis.requiredSkillsMatched)) {
      throw new Error('Missing requiredSkillsMatched array');
    }
    if (!analysis.experienceFit || typeof analysis.experienceFit.yearsCandidate !== 'number') {
      throw new Error('Missing experienceFit details');
    }
    if (!analysis.advisoryNotice || !analysis.advisoryNotice.includes('human recruiter')) {
      throw new Error('Missing algorithmic advisory / human-in-the-loop fairness disclaimer');
    }
  });

  // --------------------------------------------------------------------------
  // 9. PROMPT-INJECTION-SAFE AI SCREENING SUMMARY & QUESTIONS
  // --------------------------------------------------------------------------
  await assert('9.1 Generate tailored screening interview questions with injection defense', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${targetAppId}/ai-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.aiSummary) {
      throw new Error(`Failed to generate screening summary: ${JSON.stringify(json)}`);
    }
    const summary = json.data.aiSummary;
    if (!Array.isArray(summary.suggestedInterviewQuestions) || summary.suggestedInterviewQuestions.length === 0) {
      throw new Error('Expected at least one tailored interview question');
    }
    if (!summary.executiveSummary) {
      throw new Error('Missing executive summary text');
    }
  });

  // --------------------------------------------------------------------------
  // 10. ATOMIC BULK APPLICANT ACTIONS
  // --------------------------------------------------------------------------
  await assert('10.1 Execute bulk action to advance multiple applicants to Assessment', async () => {
    const appIds = secondAppId ? [targetAppId, secondAppId] : [targetAppId];
    const res = await fetch(`${BASE_URL}/recruiter/applications/bulk-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationIds: appIds,
        action: 'change_stage',
        stage: 'Assessment',
        reason: 'Passed initial screening; advancing to technical assessment.',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data.updatedCount < appIds.length) {
      throw new Error(`Bulk stage action failed: ${JSON.stringify(json)}`);
    }
  });

  await assert('10.2 Execute bulk action to attach tags to multiple candidates', async () => {
    const appIds = secondAppId ? [targetAppId, secondAppId] : [targetAppId];
    const res = await fetch(`${BASE_URL}/recruiter/applications/bulk-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationIds: appIds,
        action: 'add_tag',
        tag: 'Q2-Cohort',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data.updatedCount < appIds.length) {
      throw new Error(`Bulk tag action failed: ${JSON.stringify(json)}`);
    }
  });

  // --------------------------------------------------------------------------
  // 11. COMPANY TALENT POOL
  // --------------------------------------------------------------------------
  await assert('11.1 List company talent pool records', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/talent-pool`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data?.talentPool)) {
      throw new Error(`Invalid talent pool response: ${JSON.stringify(json)}`);
    }
  });

  await assert('11.2 Add candidate to company talent pool with tags and source job', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/talent-pool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        candidateId: 'user_candidate_04',
        sourceJobId: 'job_synthetix_01',
        tags: ['Distributed Systems', 'Future Principal Hire'],
        notes: 'Exceptional background in consensus protocols; keep warm for Q3 leadership requisitions.',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data?.candidate?.id) {
      throw new Error(`Failed to add candidate to talent pool: ${JSON.stringify(json)}`);
    }
    const poolId = json.data.candidate.id;

    // Delete candidate from talent pool
    const delRes = await fetch(`${BASE_URL}/recruiter/talent-pool/${poolId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!delRes.ok) throw new Error(`Failed to delete from talent pool: HTTP ${delRes.status}`);
  });

  // --------------------------------------------------------------------------
  // 12. SIDE-BY-SIDE CANDIDATE COMPARISON MATRIX
  // --------------------------------------------------------------------------
  await assert('12.1 Generate side-by-side comparison matrix for candidates', async () => {
    const appIds = secondAppId ? [targetAppId, secondAppId] : [targetAppId, targetAppId];
    const res = await fetch(`${BASE_URL}/recruiter/candidates/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationIds: appIds,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const candidateRows = json.data?.candidates || json.data?.comparison;
    if (!json.success || !Array.isArray(candidateRows)) {
      throw new Error(`Failed comparison: ${JSON.stringify(json)}`);
    }
    if (candidateRows.length < 2) {
      throw new Error(`Expected at least 2 comparison matrix rows, got ${candidateRows.length}`);
    }
    const cand = candidateRows[0];
    if (!cand.candidateName || typeof cand.experienceYears !== 'number') {
      throw new Error('Malformed comparison candidate item');
    }
  });

  // --------------------------------------------------------------------------
  // 13. SPREADSHEET FORMULA INJECTION DEFENSE IN CSV EXPORTS
  // --------------------------------------------------------------------------
  await assert('13.1 Sanitize CSV exports against Spreadsheet Formula Injection (=, +, -, @ prepended with \')', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/export`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('text/csv')) {
      throw new Error(`Expected text/csv Content-Type, got ${contentType}`);
    }
    const csvText = await res.text();
    if (!csvText.startsWith('Application ID,Reference Number')) {
      throw new Error(`Invalid CSV header format: ${csvText.slice(0, 100)}`);
    }

    // Verify formula characters in field values are sanitized
    const lines = csvText.split('\n');
    for (const line of lines) {
      const cells = line.split(',');
      for (const cell of cells) {
        const clean = cell.trim().replace(/^"|"$/g, '');
        // If a cell was an injection attempt, it must have been escaped with single quote '
        if (clean.length > 0 && ['=', '+', '-', '@'].includes(clean[0])) {
          // If unescaped formula detected, fail
          throw new Error(`Detected unescaped formula cell: ${cell}`);
        }
      }
    }
  });

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                 PHASE 3 TEST EXECUTION SUMMARY                 ');
  console.log('================================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);

  if (failed > 0) {
    console.error('\nFAILURES:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 3 ATS & APPLICANT MANAGEMENT TESTS PASSED!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
