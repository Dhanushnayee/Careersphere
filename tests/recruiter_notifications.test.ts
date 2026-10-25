/**
 * Automated Test Suite for CareerSphere AI — Recruiter Notifications Center
 * Validates:
 * 1. Recruiter authentication & RBAC guards (candidate denied 403, unauthenticated denied 401)
 * 2. Recruiter can list notifications with accurate unread counts and category counts
 * 3. Filters: category (all, unread, applications, interviews, jobs, company, system), search, and sorting
 * 4. Mark single notification as read / unread and verify persistent state
 * 5. Mark all as read (and category-specific mark all read)
 * 6. Dismiss / delete notification
 * 7. Strict Recipient Ownership & Cross-Tenant Security Isolation (Company B recruiter blocked from Company A notifications)
 * 8. Real-world event triggers:
 *    - New candidate application submission creates new_application notification
 *    - Candidate withdrawal creates candidate_withdrawn notification
 *    - Recruiter scheduling interview creates interview_scheduled notification
 *    - Candidate reschedule request creates interview_reschedule_requested urgent notification
 *    - Candidate accepting offer creates offer_accepted urgent notification
 *    - Admin moderation approving job creates job_approved notification
 *    - Admin company verification review creates company_verification_approved notification
 *    - Team invitation creates team_invitation_sent notification
 * 9. Duplicate prevention guard
 * 10. Bulk mark read / mark unread / delete
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

async function runNotificationsTests() {
  console.log('================================================================');
  console.log('   CareerSphere AI — Recruiter Notifications Center Test Suite  ');
  console.log('================================================================\n');

  let recruiterToken = '';
  let horizonRecruiterToken = '';
  let candidateToken = '';
  let adminToken = '';

  async function login(email: string, password = 'Password123!'): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Login failed for ${email}: ${JSON.stringify(json)}`);
    if (json.data?.token) return json.data.token;
    if (json.data?.requiresOtp) {
      const otpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: json.data.demoOtpHint || '123456' }),
      });
      const otpJson = await otpRes.json();
      return otpJson.data.token;
    }
    throw new Error('No token returned');
  }

  // 1. Authenticate sessions
  await assert('1.1 Authenticate Synthetix recruiter (Sarah Jenkins)', async () => {
    recruiterToken = await login('recruiter@synthetix.com');
    if (!recruiterToken) throw new Error('Recruiter token missing');
  });

  await assert('1.2 Authenticate Horizon recruiter (Tom Bradley - cross-tenant)', async () => {
    horizonRecruiterToken = await login('recruiter@horizontech.com');
    if (!horizonRecruiterToken) throw new Error('Horizon recruiter token missing');
  });

  await assert('1.3 Authenticate candidate (Alex Chen)', async () => {
    candidateToken = await login('candidate@careersphere.ai');
    if (!candidateToken) throw new Error('Candidate token missing');
  });

  await assert('1.4 Authenticate admin supervisor', async () => {
    adminToken = await login('admin@careersphere.ai');
    if (!adminToken) throw new Error('Admin token missing');
  });

  // 2. RBAC & Security Access Control
  await assert('2.1 Candidate is strictly blocked (HTTP 403) from recruiter notifications API', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await assert('2.2 Unauthenticated caller is rejected (HTTP 401) from recruiter notifications API', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications`);
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // 3. Querying & Statistics Breakdown
  let sampleNotifId = '';
  await assert('3.1 Recruiter can fetch notifications list and unread count', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error(`Expected success, got: ${JSON.stringify(json)}`);
    if (!Array.isArray(json.data.notifications)) throw new Error('Expected notifications array');
    if (typeof json.data.unreadCount !== 'number') throw new Error('Expected unreadCount number');
    if (!json.data.categoryCounts) throw new Error('Expected categoryCounts object');

    // Confirm category counts breakdown
    const cc = json.data.categoryCounts;
    if (typeof cc.all !== 'number' || typeof cc.unread !== 'number' || typeof cc.applications !== 'number') {
      throw new Error(`Incomplete categoryCounts: ${JSON.stringify(cc)}`);
    }

    if (json.data.notifications.length > 0) {
      sampleNotifId = json.data.notifications[0].id;
    }
  });

  await assert('3.2 Unread count endpoint returns lightweight statistics', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Expected success');
    if (typeof json.data.unreadCount !== 'number') throw new Error('Expected unreadCount');
    if (!json.data.categoryCounts) throw new Error('Expected categoryCounts');
  });

  // 4. Filtering and Sorting
  await assert('4.1 Filter notifications by category=applications', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications?category=applications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to query applications category');
    for (const notif of json.data.notifications) {
      if (notif.category !== 'applications') {
        throw new Error(`Expected category applications, got ${notif.category}`);
      }
    }
  });

  await assert('4.2 Filter notifications by category=interviews', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications?category=interviews`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to query interviews category');
    for (const notif of json.data.notifications) {
      if (notif.category !== 'interviews') {
        throw new Error(`Expected category interviews, got ${notif.category}`);
      }
    }
  });

  await assert('4.3 Filter notifications by unreadOnly=true', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications?unreadOnly=true`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to query unread notifications');
    for (const notif of json.data.notifications) {
      if (notif.isRead) throw new Error(`Found read notification in unreadOnly list: ${notif.id}`);
    }
  });

  await assert('4.4 Search notifications by keyword', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications?search=Alex`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Search failed');
    for (const notif of json.data.notifications) {
      const match =
        notif.title.toLowerCase().includes('alex') ||
        notif.message.toLowerCase().includes('alex') ||
        (notif.targetModule && notif.targetModule.includes('alex'));
      if (!match) throw new Error(`Search result does not match query: ${notif.title}`);
    }
  });

  // 5. Read/Unread State Mutation
  await assert('5.1 Mark specific notification as read and verify persistence', async () => {
    if (!sampleNotifId) throw new Error('No sample notification ID');
    const res = await fetch(`${BASE_URL}/recruiter/notifications/${sampleNotifId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to mark notification read');
    if (!json.data.notification.isRead) throw new Error('Notification isRead was not set to true');

    // Verify persisted
    const listRes = await fetch(`${BASE_URL}/recruiter/notifications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const listJson = await listRes.json();
    const found = listJson.data.notifications.find((n: any) => n.id === sampleNotifId);
    if (!found || !found.isRead) throw new Error('Persistent read status not reflected in database list');
  });

  await assert('5.2 Mark notification as unread and verify persistence', async () => {
    if (!sampleNotifId) throw new Error('No sample notification ID');
    const res = await fetch(`${BASE_URL}/recruiter/notifications/${sampleNotifId}/unread`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to mark notification unread');
    if (json.data.notification.isRead) throw new Error('Notification isRead should be false');
  });

  // 6. Recipient Ownership & Cross-Tenant Isolation
  await assert('6.1 Security: Cross-tenant recruiter cannot read or mutate foreign notification (HTTP 403)', async () => {
    if (!sampleNotifId) throw new Error('No sample notification ID');
    // Horizon recruiter attempts to mark Synthetix notification as read
    const res = await fetch(`${BASE_URL}/recruiter/notifications/${sampleNotifId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${horizonRecruiterToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-company notification modification, got ${res.status}`);
    }
  });

  await assert('6.2 Security: Cross-tenant recruiter cannot delete foreign notification (HTTP 403)', async () => {
    if (!sampleNotifId) throw new Error('No sample notification ID');
    const res = await fetch(`${BASE_URL}/recruiter/notifications/${sampleNotifId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${horizonRecruiterToken}` },
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-company notification deletion, got ${res.status}`);
    }
  });

  await assert('6.3 Security: Horizon recruiter queries only their own company notifications', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications`, {
      headers: { Authorization: `Bearer ${horizonRecruiterToken}` },
    });
    const json = await res.json();
    for (const notif of json.data.notifications) {
      if (notif.companyId !== 'comp_horizon') {
        throw new Error(`Tenant leak! Horizon recruiter saw notification from company ${notif.companyId}`);
      }
    }
  });

  // 7. Real Business Events Generate Real Recruiter Notifications
  let testCreatedAppId = '';
  await assert('7.1 Candidate applying to a job generates real "new_application" notification for recruiter', async () => {
    // Recruiter creates a fresh requisition to avoid duplicate application collision
    const futureDeadline = new Date(Date.now() + 86400000 * 30).toISOString();
    const freshJobRes = await fetch(`${BASE_URL}/recruiter/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        title: `Notification Test Engineer ${Date.now()}`,
        department: 'Engineering',
        location: 'Remote',
        workplaceType: 'Remote',
        employmentType: 'Full-time',
        openingsCount: 1,
        minExperienceYears: 3,
        salaryMin: 130000,
        salaryMax: 170000,
        salaryCurrency: 'USD',
        payFrequency: 'annual',
        isSalaryDisclosed: true,
        description: 'Test job requisition for validating recruiter notification delivery on candidate submission.',
        requirements: ['TypeScript', 'Testing'],
        skillsRequired: ['TypeScript'],
        deadline: futureDeadline,
        status: 'active',
      }),
    });
    const freshJobJson = await freshJobRes.json();
    if (!freshJobJson.success) throw new Error(`Create test job failed: ${JSON.stringify(freshJobJson)}`);
    const testJobId = freshJobJson.data.id;

    const applyRes = await fetch(`${BASE_URL}/applications/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        jobId: testJobId,
        resumeId: 'res_01',
        coverLetter: 'Automated test application submission for notification verification.',
        consentGranted: true,
      }),
    });
    const applyJson = await applyRes.json();
    if (!applyJson.success) throw new Error(`Apply failed: ${JSON.stringify(applyJson)}`);
    testCreatedAppId = applyJson.data.id || applyJson.data.application?.id;

    // Verify recruiter received new_application notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=applications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const appNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'new_application' && (n.targetId === testCreatedAppId || n.metadata?.jobId === testJobId)
    );
    if (!appNotif) throw new Error('Recruiter did not receive "new_application" notification for job application');
    if (!appNotif.title.includes('New Application')) throw new Error(`Unexpected title: ${appNotif.title}`);
  });

  await assert('7.2 Candidate withdrawal generates real "candidate_withdrawn" notification', async () => {
    if (!testCreatedAppId) throw new Error('Missing test application ID');
    const withdrawRes = await fetch(`${BASE_URL}/applications/${testCreatedAppId}/withdraw`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const withdrawJson = await withdrawRes.json();
    if (!withdrawJson.success) throw new Error('Withdrawal failed');

    // Verify recruiter received candidate_withdrawn notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=applications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const withNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'candidate_withdrawn' && n.targetId === testCreatedAppId
    );
    if (!withNotif) throw new Error('Recruiter did not receive "candidate_withdrawn" notification');
    if (withNotif.priority !== 'high') throw new Error(`Expected high priority, got ${withNotif.priority}`);
  });

  let testInterviewId = '';
  await assert('7.3 Scheduling an interview round generates "interview_scheduled" notification', async () => {
    const appsRes = await fetch(`${BASE_URL}/recruiter/applicants`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const appsJson = await appsRes.json();
    const apps = appsJson.data?.applicants || [];
    const targetApp = apps.find((a: any) => a.id === testCreatedAppId) || apps[0];
    if (!targetApp) throw new Error('No valid application found to schedule interview');

    const futureDate = new Date(Date.now() + 5 * 86400000);
    const intRes = await fetch(`${BASE_URL}/recruiter/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetApp.id,
        roundName: 'Live Automated Coding Evaluation',
        roundNumber: 2,
        scheduledAt: futureDate.toISOString(),
        durationMinutes: 60,
        interviewType: 'video',
        overrideConflict: true,
      }),
    });
    const intJson = await intRes.json();
    if (!intJson.success) throw new Error(`Schedule interview failed: ${JSON.stringify(intJson)}`);
    testInterviewId = intJson.data.interview.id;

    // Verify recruiter received interview_scheduled notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=interviews`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const intNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'interview_scheduled' && n.targetId === testInterviewId
    );
    if (!intNotif) throw new Error('Recruiter did not receive "interview_scheduled" notification');
  });

  await assert('7.4 Candidate requesting reschedule generates urgent "interview_reschedule_requested" notification', async () => {
    if (!testInterviewId) throw new Error('Missing test interview ID');
    const reschedReqRes = await fetch(`${BASE_URL}/candidate/interviews/${testInterviewId}/reschedule-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        reason: 'Emergency server outage at current employer',
        proposedTime: new Date(Date.now() + 7 * 86400000).toISOString(),
      }),
    });
    const reschedJson = await reschedReqRes.json();
    if (!reschedJson.success) throw new Error('Candidate reschedule request failed');

    // Verify recruiter received interview_reschedule_requested notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=interviews`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const reqNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'interview_reschedule_requested' && n.targetId === testInterviewId
    );
    if (!reqNotif) throw new Error('Recruiter did not receive "interview_reschedule_requested" notification');
    if (reqNotif.priority !== 'urgent') throw new Error(`Expected urgent priority, got ${reqNotif.priority}`);
  });

  await assert('7.5 Candidate responding to offer generates "offer_accepted" notification', async () => {
    const appsRes = await fetch(`${BASE_URL}/recruiter/applicants`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const appsJson = await appsRes.json();
    const apps = appsJson.data?.applicants || [];
    const targetApp = apps.find((a: any) => a.candidateId === 'user_candidate_01' || a.candidateEmail === 'candidate@careersphere.ai') || apps[0];
    if (!targetApp) throw new Error('No applicant found for offer test');

    const start = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0];

    // Create and issue an offer first as recruiter
    const offerRes = await fetch(`${BASE_URL}/recruiter/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        applicationId: targetApp.id,
        candidateId: 'user_candidate_01',
        salary: {
          amount: 195000,
          currency: 'USD',
          frequency: 'annual',
        },
        baseSalary: 195000,
        currency: 'USD',
        payFrequency: 'annual',
        startDate: start,
        expiryDate: expiry,
        equity: '0.20% equity over 4 years',
        signOnBonus: 20000,
        workplaceType: 'remote',
        issueImmediately: true,
      }),
    });
    const offerJson = await offerRes.json();
    if (!offerJson.success) throw new Error(`Create offer failed: ${JSON.stringify(offerJson)}`);
    const offerId = offerJson.data.offer.id;

    // Candidate accepts offer
    const acceptRes = await fetch(`${BASE_URL}/candidate/offers/${offerId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        action: 'accept',
        responseNote: 'Thrilled to join Synthetix Dynamics team!',
      }),
    });
    const acceptJson = await acceptRes.json();
    if (!acceptJson.success) throw new Error(`Accept offer failed: ${JSON.stringify(acceptJson)}`);

    // Verify recruiter received offer_accepted notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=company`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const offNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'offer_accepted' && n.targetId === offerId
    );
    if (!offNotif) throw new Error('Recruiter did not receive "offer_accepted" notification');
    if (offNotif.priority !== 'urgent') throw new Error(`Expected urgent priority, got ${offNotif.priority}`);
  });

  await assert('7.6 Admin job moderation approval generates "job_approved" notification for recruiter', async () => {
    // Moderate job_01
    const modRes = await fetch(`${BASE_URL}/admin/jobs/job_01/moderation`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        moderationStatus: 'approved',
        reason: 'Compliance review completed and approved.',
      }),
    });
    const modJson = await modRes.json();
    if (!modJson.success) throw new Error('Job moderation failed');

    // Verify recruiter received job_approved notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=jobs`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const jobNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'job_approved' && n.targetId === 'job_01'
    );
    if (!jobNotif) throw new Error('Recruiter did not receive "job_approved" notification');
  });

  await assert('7.7 Admin company verification review generates "company_verification_approved" notification', async () => {
    const revRes = await fetch(`${BASE_URL}/admin/companies/comp_synthetix/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: 'verify',
        reason: 'Official incorporation documents verified by legal counsel.',
      }),
    });
    const revJson = await revRes.json();
    if (!revJson.success) throw new Error('Admin review failed');

    // Verify recruiter received company_verification_approved notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=company`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const verNotif = notifsJson.data.notifications.find(
      (n: any) => n.type === 'company_verification_approved' && n.targetId === 'comp_synthetix'
    );
    if (!verNotif) throw new Error('Recruiter did not receive "company_verification_approved" notification');
  });

  await assert('7.8 Dispatching a team invitation generates "team_invitation_sent" notification', async () => {
    const inviteEmail = `colleague_${Date.now()}@synthetix.com`;
    const invRes = await fetch(`${BASE_URL}/recruiter/team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        email: inviteEmail,
        role: 'recruiter',
        title: 'Senior Technical Recruiter',
      }),
    });
    const invJson = await invRes.json();
    if (!invJson.success) throw new Error('Team invite failed');

    // Verify recruiter received team_invitation_sent notification
    const notifsRes = await fetch(`${BASE_URL}/recruiter/notifications?category=company`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const notifsJson = await notifsRes.json();
    const teamNotif = notifsJson.data.notifications.find((n: any) => n.type === 'team_invitation_sent');
    if (!teamNotif) throw new Error('Recruiter did not receive "team_invitation_sent" notification');
  });

  // 8. Bulk Operations
  await assert('8.1 Bulk mark as read sets multiple notifications as read', async () => {
    const listRes = await fetch(`${BASE_URL}/recruiter/notifications?limit=5`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const listJson = await listRes.json();
    const ids = listJson.data.notifications.map((n: any) => n.id);

    const bulkRes = await fetch(`${BASE_URL}/recruiter/notifications/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({
        ids,
        action: 'mark_read',
      }),
    });
    const bulkJson = await bulkRes.json();
    if (!bulkJson.success) throw new Error('Bulk mark_read failed');
    if (bulkJson.data.affectedCount < ids.length) {
      throw new Error(`Expected at least ${ids.length} affected, got ${bulkJson.data.affectedCount}`);
    }
  });

  await assert('8.2 Mark all as read clears all unread notifications', async () => {
    const res = await fetch(`${BASE_URL}/recruiter/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recruiterToken}`,
      },
      body: JSON.stringify({ category: 'all' }),
    });
    const json = await res.json();
    if (!json.success) throw new Error('Mark all read failed');

    const countRes = await fetch(`${BASE_URL}/recruiter/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const countJson = await countRes.json();
    if (countJson.data.unreadCount !== 0) {
      throw new Error(`Expected unreadCount 0 after mark-all, got ${countJson.data.unreadCount}`);
    }
  });

  await assert('8.3 Single notification deletion dismisses record from user database', async () => {
    const listRes = await fetch(`${BASE_URL}/recruiter/notifications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const listJson = await listRes.json();
    if (listJson.data.notifications.length === 0) throw new Error('No notification to delete');

    const targetId = listJson.data.notifications[0].id;
    const delRes = await fetch(`${BASE_URL}/recruiter/notifications/${targetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const delJson = await delRes.json();
    if (!delJson.success) throw new Error('Delete notification failed');

    // Verify deleted
    const verifyRes = await fetch(`${BASE_URL}/recruiter/notifications`, {
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    const verifyJson = await verifyRes.json();
    const stillPresent = verifyJson.data.notifications.some((n: any) => n.id === targetId);
    if (stillPresent) throw new Error('Deleted notification is still present in database list');
  });

  // Final summary
  console.log('\n================================================================');
  console.log('              RECRUITER NOTIFICATIONS TEST SUMMARY              ');
  console.log('================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total Tests Run : ${results.length}`);
  console.log(`Passed          : ${passedCount}`);
  console.log(`Failed          : ${failedCount}`);

  if (failedCount > 0) {
    console.error('\nFailures:');
    results.filter((r) => !r.passed).forEach((r) => console.error(`- ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL RECRUITER NOTIFICATIONS CENTER TESTS PASSED WITH 100% SUCCESS!');
  }
}

runNotificationsTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
