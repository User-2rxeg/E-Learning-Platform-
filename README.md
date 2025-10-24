Features
1. User Management
• User Authentication and Role-Based Access Control:
– Students, instructors, and admins with distinct access levels.
– Secure login and registration using JSON Web Tokens (JWT).
• User Profile Management:
– Students and instructors can update their personal information, view enrolled courses, track
completed courses, and monitor average scores.
2. Course Management
• Course Creation and Organization:
– Instructors can create course modules, upload multimedia resources (videos, PDFs), and or-
ganize content hierarchically.
• Version Control:
– Enable instructors to update course content while maintaining access to previous versions.
• Search Functionality:
– Users can search for a certain course.
– Instructors can search for a certain student.
– Students can search for a certain instructor.
1
3. Interactive Modules
• Quizzes and Assessments:
– Adaptive quizzes dynamically adjust question diﬃculty based on user performance.
• Real-Time Feedback:
– Instant feedback on quizzes, highlighting correct answers and areas for improvement.
4. Performance Tracking
• Student Dashboard:
– Visualizes progress with metrics like course completion rates, average scores, and engagement
trends.
• Instructor Analytics:
– Reports on student engagement, content eﬀectiveness, and assessment results.
– Downloadable analytics for external use.
5. Security and Data Protection
• Secure Authentication:
– Use JSON Web Tokens (JWT) for secure login and session management.
– Passwords stored with hashing using bcrypt to ensure data integrity.
• Role-Based Access Control (RBAC):
– Implement middleware in the backend to control access to APIs based on user roles (student,
instructor, admin).
• Data Backup:
– Simple scheduled backups of critical data (e.g., user accounts, course progress) to prevent loss.
6. Communication Features
• Real-Time Chat:
– Enable Instructors to communicate with students for queries and discussions.
– Students can also form study groups and chat with peers.
• Discussion Forums:
– Forums for course-specific discussions moderated by instructors.
– Features include thread creation, replies, and search functionality.
• Notification System:
– Students and instructors receive notifications for new messages, replies, or announcements.
• Saved Conversations:
– Chat history and forum discussions are saved for future reference.
2
Additional Features
Teams consist of 5-8 members will choose 1 out of 3 additional features.
Teams consist of 9 members will choose 2 out of 3 additional features.
Teams consist of 10 members will implement the 3 additional features.
a) Data Science: Adaptive Recommendation Engine: An AI-powered recommendation system
tailors content to user preferences, performance metrics, and engagement patterns.
b) Information Security: Biometric Authentication: Provides robust identity verification for
exams and other critical operations.
c) Software Engineering: Quick Notes:Allow users to create and save quick notes for their courses
or modules. This feature provides students with a personal space to jot down key points, reminders,
or study tips as they navigate the course.
User Stories
1. User Management
• As a student, I want to securely log in and access my course progress.
• As an instructor, I want to create and manage student accounts and assign them to courses.
2. Course Management
• As an instructor, I want to create, update, and organize course modules with resources and quizzes.
• As a student, I want personalized learning paths to guide my progress eﬀectively.
3. Interactive Modules
• As a student, I want immediate feedback on quizzes to understand my mistakes.
• As an instructor, I want to create adaptive quizzes that challenge students based on their skills.
4. Performance Tracking
• As a student, I want a dashboard to visualize my progress and engagement metrics.
• As an instructor, I want analytics on student performance to identify areas needing improvement.
5. Security and Data Protection
• Students:
– As a student, I want my account to be securely protected against unauthorized access.
• Instructors:
– Asaninstructor,Iwantrole-basedaccesstomanageonlythecoursesandusersIamresponsible
for.
• Admins:
– As an admin, I want a simple logging system to track failed login attempts or unauthorized
API access.
3
6. Communication Features
• As a student , I want to chat with peers to clarify doubts or discuss topics.
• As an instructor, I want to communicate with students via chat or discussion forums to answer
questions and guide discussions.
Additional Features User Stories
Data Science: Adaptive Learning Recommendation Engine
• Students:
– As a student, I want to receive recommendations for additional courses or materials that match
my learning progress and interests.
– As a student, I want personalized suggestions to help me identify areas I need to improve.
Information Security: Biometric Authentication
• Students:
– As a student, I want to use biometric authentication during exams to secure my identity.
– As a student, I want to know my biometric data is encrypted and safe.
• Admins:
– As an admin, I want to enforce biometric authentication for high-stakes actions to maintain
exam integrity.
Software Engineering: Quick Notes
• Students:
– As a student, I want to create notes tied to specific modules to organize my learning eﬀectively.
– As a student, I want my notes to autosave to prevent data loss.
– As a student, I want to edit and delete my notes to keep them updated and relevant.
• Instructors:
– As an instructor, I want students to have a personal space to take notes to enhance their
learning process.
Technology Stack
• Backend: NestJS (Node.js, TypeScript).
• Frontend: Next.js.
• Database: MongoDB for flexible and scalable storage.
• Data Science: Python-based recommendation engine served via Flask or FastAPI.
• Authentication: JSON Web Tokens (JWT) and bcrypt for secure login.
• Security: Multi-Factor Authentication (MFA).