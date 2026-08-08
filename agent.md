# SME Solutions Project

## Business Requirements

* SME have problems they want to solve and owners don't have time to find solutions. Polytechnics have budget to let students solve some of these problems for free for SME bosses.
* Build a MVP of a web app for SME to submit project and for students to submit their proposals.
* The MVP consists of 6 pages. See "Web Pages to Build" section below
* No more functionality: no archive, no search/filter. Keep it simple.
* The priority is a slick, professional, gorgeous UI/UX with very simple features
* The app should open with dummy data populated for the single board

## Additional Specifications

### Authentication and Profiles

* Use Supabase Auth for sign-up, email verification, login, forgotten-password, and password-reset flows.
* Database access must use the signed-in user's Supabase session. The publishable key alone must not grant access to application data.
* Create one profile automatically for each Supabase Auth user.
* Require and validate `user_id`, `display_name`, and `account_type` during sign-up. `account_type` must be either `sme_owner` or `student`; invalid or missing values must be rejected rather than silently converted to another role.
* `user_id` must be globally unique. Do not derive a fallback solely from the email prefix because different email addresses can share the same prefix.
* Users may update only editable profile fields such as `display_name`. The profile ID, user ID, and account type must be immutable after registration through normal client operations.
* A student must never be able to promote their account to SME Owner by updating their profile.

### Project and Proposal Integrity

* Only SME Owner accounts can create projects, and every project must belong to the authenticated SME Owner who created it.
* Only Student accounts can create proposals, and every proposal must belong to the authenticated student who submitted it.
* A student may submit no more than one proposal for the same project.
* Proposal identity, `project_id`, and `student_id` must be immutable after creation. Students may update only the proposal title and description.
* A project may be assigned to no more than one proposal at a time.
* An assigned proposal must belong to the same project that references it.
* Assigning a new proposal must atomically replace the previous assignment so the project can never show multiple assigned students.
* Define deletion behavior explicitly. If project deletion is supported, deleting a project must also remove its proposals without being blocked by its assigned-proposal reference. If deletion is outside the MVP scope, do not expose project-delete functionality or unnecessary delete policies.

### Data Access and Row Level Security

* Enable Row Level Security on all application tables.
* All project records may be viewed by authenticated users so students can browse available requests and SME Owners can view their projects.
* A proposal may be viewed only by the student who submitted it or the SME Owner who owns the associated project. Students must not be able to view competing students' proposal content.
* SME Owners may create, update, assign, and otherwise manage only projects that they own.
* Students may create and update only their own proposals.
* Row Level Security must enforce authorization independently of the user interface. Client-side role checks are for usability only and must not be treated as security controls.
* Use the Supabase publishable key in the browser. Never expose a secret key, service-role key, database password, or direct database connection string to the client.

### Database Constraints and Lifecycle

* Enforce role, ownership, proposal uniqueness, and assignment integrity at the database layer in addition to application validation.
* Keep `created_at` and `updated_at` timestamps for profiles, projects, and proposals, and update `updated_at` automatically whenever a record changes.
* Add indexes for owner project listings, project creation dates, proposals by project, and proposals by student.
* Ensure foreign-key actions are compatible with the intended deletion lifecycle and cannot create circular restrictions.

## Technical Details

* Implemented as a modern NextJS app, client rendered
* The NextJS app should be created in a subdirectory frontend
* No persistence
* No user management for the MVP
* Use popular libraries
* As simple as possible but with an elegant UI

## Color Scheme

* Accent Yellow: #ecad0a - accent lines, highlights
* Blue Primary: #209dd7 - links, key sections
* Purple Secondary: #753991 - submit buttons, important actions
* Dark Navy: #032147 - main headings
* Gray Text: #888888 - supporting text, labels

## Strategy

* Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
* Execute the plan ensuring all critiera are met
* Carry out extensive integration testing with Playwright or similar, fixing defects
* Only complete when the MVP is finished and tested, with the server running and ready for the user



## Coding standards

* Use latest versions of libraries and idiomatic approaches as of today
* Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
* Be concise. Keep README minimal. IMPORTANT: no emojis ever

## Web Pages to Build

Below are the web pages to build

### Sign Up

* Users can sign up either as a SME Owner or Students
* Compulsory Fields
* User ID
* Account Type: SME Owner or Student
* Email Address
* Password
* An email should be sent out with a verification link. Account at this point is disabled.

### Email Verified

* Set the account as enabled.
* Provide a link to the login page

### Forget Password

* Standard forget password features

### Reset Password

* Standard reset password features

### SME Home Page

* Display a list of projects in table format that was created by the SME owner.
* When user click on the project title, it should link to the SME Project Details page
* Display this information in the table
* Date Created
* Project
* Num of Proposals
* Assigned To (indicates which student the project was assigned to)

### SME Project Details

* This page is used to display project details as well as for SME Owners to create new project
* The top portion displays project details, which includes
* Project Title
* Description
* Image Reference
* The bottom part displays a table of proposals submitted by students. The columns to display are
* Student Name
* Proposal (hyperlink that opens a new tab to the Review Proposal page)
* Assign (assigns project to student. If it was assigned to a previous student, that record should now not reflected Assigned)

### Review Proposal

### Student Home Page

* Display a list of projects in table format that Student had submitted proposals for
* When user click on the Proposal title, it should link to the Submit Proposal page
* Display this information in the table
* Date Created
* Project
* Proposal
* Status (show Assigned if SME owners assigned to this student)

### Submit Request

* Display proposal's details
* Date Submitted
* Student Name
* Proposal Title
* Description
* Include an Assign button. Note only 1 proposal can be assigned to a project. All and any other proposals that had been assigned to this project previously must now be set as unassigned.

### Search Request

* This page is for students to search for Proposal Request
* Only 1 field is provided and it is to matched to either Project Title or Description
* Display a list of relevant projects in table format
* Date Created
* Project
* Num of Proposals
* Assigned To (indicates which student the project was assigned to)

### Submit Proposal

* This page is used to display proposal details as well as for students to create new project
* The top portion displays project details, which includes
* Project Title
* Description
* Image Reference
* The bottom part displays a proposals details, which includes
* Proposal Title
* Description

