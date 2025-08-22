// backend/scripts/seed-database.ts
// Run with: npx ts-node scripts/seed-database.ts

import { MongoClient, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Update this to match your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning';

interface SeedData {
    users: any[];
    courses: any[];
    quizzes: any[];
    performances: any[];
    forums: any[];
    conversations: any[];
    notifications: any[];
}

async function seedDatabase() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db();

        // Optional: Clear existing data (comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await db.collection('users').deleteMany({});
        await db.collection('courses').deleteMany({});
        await db.collection('quizzes').deleteMany({});
        await db.collection('quizattempts').deleteMany({});
        await db.collection('performances').deleteMany({});
        await db.collection('forums').deleteMany({});
        await db.collection('conversations').deleteMany({});
        await db.collection('messages').deleteMany({});
        await db.collection('notifications').deleteMany({});

        // Hash password for all users
        const hashedPassword = await bcrypt.hash('Password123!', 10);

        // Create Users
        console.log('👥 Creating users...');
        const usersData = [
            {
                _id: new ObjectId(),
                name: 'John Student',
                email: 'student@test.com',
                password: hashedPassword,
                role: 'student',
                isEmailVerified: true,
                isProfileComplete: true,
                profileImage: null,
                learningPreferences: ['visual', 'interactive'],
                subjectsOfInterest: ['web development', 'programming', 'javascript'],
                expertise: [],
                teachingCourses: [],
                enrolledCourses: [], // Will be updated after creating courses
                completedCourses: [],
                averageScore: 0,
                otpCode: null,
                otpExpiresAt: null,
                passwordResetOtpCode: null,
                passwordResetOtpExpiresAt: null,
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                name: 'Sarah Student',
                email: 'student2@test.com',
                password: hashedPassword,
                role: 'student',
                isEmailVerified: true,
                isProfileComplete: true,
                profileImage: null,
                learningPreferences: ['reading', 'practice'],
                subjectsOfInterest: ['data science', 'python', 'machine learning'],
                expertise: [],
                teachingCourses: [],
                enrolledCourses: [],
                completedCourses: [],
                averageScore: 0,
                otpCode: null,
                otpExpiresAt: null,
                passwordResetOtpCode: null,
                passwordResetOtpExpiresAt: null,
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                name: 'Jane Instructor',
                email: 'instructor@test.com',
                password: hashedPassword,
                role: 'instructor',
                isEmailVerified: true,
                isProfileComplete: true,
                profileImage: null,
                learningPreferences: [],
                subjectsOfInterest: [],
                expertise: ['web development', 'javascript', 'react', 'node.js'],
                teachingCourses: [], // Will be updated after creating courses
                enrolledCourses: [],
                completedCourses: [],
                averageScore: 0,
                otpCode: null,
                otpExpiresAt: null,
                passwordResetOtpCode: null,
                passwordResetOtpExpiresAt: null,
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                name: 'Mike Instructor',
                email: 'instructor2@test.com',
                password: hashedPassword,
                role: 'instructor',
                isEmailVerified: true,
                isProfileComplete: true,
                profileImage: null,
                learningPreferences: [],
                subjectsOfInterest: [],
                expertise: ['data science', 'python', 'machine learning', 'tensorflow'],
                teachingCourses: [],
                enrolledCourses: [],
                completedCourses: [],
                averageScore: 0,
                otpCode: null,
                otpExpiresAt: null,
                passwordResetOtpCode: null,
                passwordResetOtpExpiresAt: null,
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                name: 'Admin User',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true,
                isProfileComplete: true,
                profileImage: null,
                learningPreferences: [],
                subjectsOfInterest: [],
                expertise: [],
                teachingCourses: [],
                enrolledCourses: [],
                completedCourses: [],
                averageScore: 0,
                otpCode: null,
                otpExpiresAt: null,
                passwordResetOtpCode: null,
                passwordResetOtpExpiresAt: null,
                mfaEnabled: false,
                mfaSecret: null,
                mfaBackupCodes: [],
                notifications: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const userResult = await db.collection('users').insertMany(usersData);
        const [student1, student2, instructor1, instructor2, admin] = usersData;

        // Create Courses
        console.log('📚 Creating courses...');
        const coursesData = [
            {
                _id: new ObjectId(),
                title: 'Introduction to Web Development',
                description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites. This comprehensive course covers everything from basic HTML structure to advanced JavaScript concepts.',
                instructorId: instructor1._id,
                modules: [
                    {
                        title: 'Getting Started with HTML',
                        resources: [
                            {
                                _id: new ObjectId(),
                                resourceType: 'video',
                                url: 'https://example.com/html-intro.mp4',
                                filename: 'html-introduction.mp4',
                                mimeType: 'video/mp4',
                                size: 150000000,
                                uploadedBy: instructor1._id,
                                uploadedAt: new Date()
                            },
                            {
                                _id: new ObjectId(),
                                resourceType: 'pdf',
                                url: 'https://example.com/html-guide.pdf',
                                filename: 'html-complete-guide.pdf',
                                mimeType: 'application/pdf',
                                size: 2500000,
                                uploadedBy: instructor1._id,
                                uploadedAt: new Date()
                            }
                        ],
                        quizzes: [], // Will add quiz references later
                        notesEnabled: true
                    },
                    {
                        title: 'CSS Fundamentals',
                        resources: [
                            {
                                _id: new ObjectId(),
                                resourceType: 'video',
                                url: 'https://example.com/css-basics.mp4',
                                filename: 'css-fundamentals.mp4',
                                mimeType: 'video/mp4',
                                size: 180000000,
                                uploadedBy: instructor1._id,
                                uploadedAt: new Date()
                            },
                            {
                                _id: new ObjectId(),
                                resourceType: 'link',
                                url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
                                uploadedBy: instructor1._id,
                                uploadedAt: new Date()
                            }
                        ],
                        quizzes: [],
                        notesEnabled: true
                    },
                    {
                        title: 'JavaScript Basics',
                        resources: [
                            {
                                _id: new ObjectId(),
                                resourceType: 'video',
                                url: 'https://example.com/js-intro.mp4',
                                filename: 'javascript-basics.mp4',
                                mimeType: 'video/mp4',
                                size: 200000000,
                                uploadedBy: instructor1._id,
                                uploadedAt: new Date()
                            }
                        ],
                        quizzes: [],
                        notesEnabled: true
                    }
                ],
                tags: ['web development', 'html', 'css', 'javascript', 'frontend', 'beginner'],
                versionHistory: [
                    {
                        version: '1.0.0',
                        updatedAt: new Date(),
                        changes: 'Initial course release'
                    }
                ],
                studentsEnrolled: [student1._id, student2._id],
                status: 'active',
                certificateAvailable: true,
                feedback: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                title: 'Python for Data Science',
                description: 'Master Python programming and its applications in data science. Learn NumPy, Pandas, Matplotlib, and machine learning basics.',
                instructorId: instructor2._id,
                modules: [
                    {
                        title: 'Python Fundamentals',
                        resources: [
                            {
                                _id: new ObjectId(),
                                resourceType: 'video',
                                url: 'https://example.com/python-basics.mp4',
                                filename: 'python-fundamentals.mp4',
                                mimeType: 'video/mp4',
                                size: 175000000,
                                uploadedBy: instructor2._id,
                                uploadedAt: new Date()
                            }
                        ],
                        quizzes: [],
                        notesEnabled: true
                    },
                    {
                        title: 'Data Analysis with Pandas',
                        resources: [
                            {
                                _id: new ObjectId(),
                                resourceType: 'video',
                                url: 'https://example.com/pandas-tutorial.mp4',
                                filename: 'pandas-data-analysis.mp4',
                                mimeType: 'video/mp4',
                                size: 190000000,
                                uploadedBy: instructor2._id,
                                uploadedAt: new Date()
                            },
                            {
                                _id: new ObjectId(),
                                resourceType: 'pdf',
                                url: 'https://example.com/pandas-cheatsheet.pdf',
                                filename: 'pandas-cheatsheet.pdf',
                                mimeType: 'application/pdf',
                                size: 500000,
                                uploadedBy: instructor2._id,
                                uploadedAt: new Date()
                            }
                        ],
                        quizzes: [],
                        notesEnabled: true
                    }
                ],
                tags: ['python', 'data science', 'pandas', 'numpy', 'machine learning', 'intermediate'],
                versionHistory: [
                    {
                        version: '1.0.0',
                        updatedAt: new Date(),
                        changes: 'Initial course release'
                    }
                ],
                studentsEnrolled: [student2._id],
                status: 'active',
                certificateAvailable: true,
                feedback: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                title: 'Advanced React Development',
                description: 'Deep dive into React.js, including hooks, context, Redux, and building production-ready applications.',
                instructorId: instructor1._id,
                modules: [
                    {
                        title: 'React Hooks Mastery',
                        resources: [
                            {
                                _id: new ObjectId(),
                                resourceType: 'video',
                                url: 'https://example.com/react-hooks.mp4',
                                filename: 'react-hooks-complete.mp4',
                                mimeType: 'video/mp4',
                                size: 210000000,
                                uploadedBy: instructor1._id,
                                uploadedAt: new Date()
                            }
                        ],
                        quizzes: [],
                        notesEnabled: true
                    }
                ],
                tags: ['react', 'javascript', 'frontend', 'advanced', 'web development'],
                versionHistory: [
                    {
                        version: '1.0.0',
                        updatedAt: new Date(),
                        changes: 'Initial course release'
                    }
                ],
                studentsEnrolled: [student1._id],
                status: 'active',
                certificateAvailable: true,
                feedback: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const courseResult = await db.collection('courses').insertMany(coursesData);
        const [webDevCourse, pythonCourse, reactCourse] = coursesData;

        // Create Quizzes
        console.log('📝 Creating quizzes...');
        const quizzesData = [
            {
                _id: new ObjectId(),
                moduleId: webDevCourse._id, // Linked to the web dev course
                questions: [
                    {
                        questionId: uuidv4(),
                        questionText: 'What does HTML stand for?',
                        choices: [
                            'Hyper Text Markup Language',
                            'High Tech Modern Language',
                            'Home Tool Markup Language',
                            'Hyperlinks and Text Markup Language'
                        ],
                        correctAnswer: 'Hyper Text Markup Language',
                        difficulty: 'easy'
                    },
                    {
                        questionId: uuidv4(),
                        questionText: 'Which HTML tag is used for the largest heading?',
                        choices: ['<h6>', '<heading>', '<h1>', '<header>'],
                        correctAnswer: '<h1>',
                        difficulty: 'easy'
                    },
                    {
                        questionId: uuidv4(),
                        questionText: 'What is the correct CSS syntax for making all <p> elements bold?',
                        choices: [
                            'p {font-weight: bold;}',
                            '<p style="font-bold">',
                            'p.all {font-weight: bold}',
                            'p {text-style: bold}'
                        ],
                        correctAnswer: 'p {font-weight: bold;}',
                        difficulty: 'medium'
                    }
                ],
                adaptive: false,
                createdBy: instructor1._id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                moduleId: pythonCourse._id,
                questions: [
                    {
                        questionId: uuidv4(),
                        questionText: 'Which of the following is used to define a function in Python?',
                        choices: ['function', 'def', 'func', 'define'],
                        correctAnswer: 'def',
                        difficulty: 'easy'
                    },
                    {
                        questionId: uuidv4(),
                        questionText: 'What is the output of print(2 ** 3)?',
                        choices: ['5', '6', '8', '9'],
                        correctAnswer: '8',
                        difficulty: 'medium'
                    }
                ],
                adaptive: true,
                createdBy: instructor2._id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const quizResult = await db.collection('quizzes').insertMany(quizzesData);
        const [htmlQuiz, pythonQuiz] = quizzesData;

        // Update courses with quiz references
        await db.collection('courses').updateOne(
            { _id: webDevCourse._id },
            { $set: { 'modules.0.quizzes': [htmlQuiz._id] } }
        );

        await db.collection('courses').updateOne(
            { _id: pythonCourse._id },
            { $set: { 'modules.0.quizzes': [pythonQuiz._id] } }
        );

        // Create Performance records
        console.log('📊 Creating performance records...');
        const performancesData = [
            {
                _id: new ObjectId(),
                studentId: student1._id,
                courseId: webDevCourse._id,
                progress: 35,
                scores: [
                    {
                        moduleId: webDevCourse._id,
                        quizId: htmlQuiz._id,
                        score: 85,
                        completedAt: new Date()
                    }
                ],
                engagementLog: [
                    {
                        timestamp: new Date(),
                        duration: 45,
                        activity: 'Watched HTML introduction video'
                    },
                    {
                        timestamp: new Date(),
                        duration: 30,
                        activity: 'Completed HTML quiz'
                    }
                ],
                lastUpdated: new Date(),
                quizStats: [
                    {
                        quizId: htmlQuiz._id,
                        recentScores: [85],
                        lastDifficulty: 'medium',
                        seenQuestionIds: [htmlQuiz.questions[0].questionId, htmlQuiz.questions[1].questionId]
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                studentId: student1._id,
                courseId: reactCourse._id,
                progress: 10,
                scores: [],
                engagementLog: [
                    {
                        timestamp: new Date(),
                        duration: 20,
                        activity: 'Started React Hooks video'
                    }
                ],
                lastUpdated: new Date(),
                quizStats: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                studentId: student2._id,
                courseId: pythonCourse._id,
                progress: 60,
                scores: [
                    {
                        moduleId: pythonCourse._id,
                        quizId: pythonQuiz._id,
                        score: 90,
                        completedAt: new Date()
                    }
                ],
                engagementLog: [
                    {
                        timestamp: new Date(),
                        duration: 120,
                        activity: 'Completed Python fundamentals module'
                    }
                ],
                lastUpdated: new Date(),
                quizStats: [
                    {
                        quizId: pythonQuiz._id,
                        recentScores: [90],
                        lastDifficulty: 'medium',
                        seenQuestionIds: [pythonQuiz.questions[0].questionId]
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                studentId: student2._id,
                courseId: webDevCourse._id,
                progress: 15,
                scores: [],
                engagementLog: [
                    {
                        timestamp: new Date(),
                        duration: 25,
                        activity: 'Watched HTML introduction video'
                    }
                ],
                lastUpdated: new Date(),
                quizStats: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('performances').insertMany(performancesData);

        // Update users with enrolled courses
        await db.collection('users').updateOne(
            { _id: student1._id },
            { $set: { enrolledCourses: [webDevCourse._id, reactCourse._id] } }
        );

        await db.collection('users').updateOne(
            { _id: student2._id },
            { $set: { enrolledCourses: [webDevCourse._id, pythonCourse._id] } }
        );

        await db.collection('users').updateOne(
            { _id: instructor1._id },
            { $set: { teachingCourses: [webDevCourse._id, reactCourse._id] } }
        );

        await db.collection('users').updateOne(
            { _id: instructor2._id },
            { $set: { teachingCourses: [pythonCourse._id] } }
        );

        // Create sample notifications
        console.log('🔔 Creating notifications...');
        const notificationsData = [
            {
                _id: new ObjectId(),
                recipientId: student1._id,
                type: 'courseUpdate',
                message: 'New module added to "Introduction to Web Development"',
                read: false,
                courseId: webDevCourse._id,
                sentBy: instructor1._id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: new ObjectId(),
                recipientId: student2._id,
                type: 'assignmentDue',
                message: 'Quiz due tomorrow in "Python for Data Science"',
                read: false,
                courseId: pythonCourse._id,
                sentBy: instructor2._id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('notifications').insertMany(notificationsData);

        console.log('✅ Database seeded successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('  Student 1: student@test.com / Password123!');
        console.log('  Student 2: student2@test.com / Password123!');
        console.log('  Instructor 1: instructor@test.com / Password123!');
        console.log('  Instructor 2: instructor2@test.com / Password123!');
        console.log('  Admin: admin@test.com / Password123!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('🔒 Database connection closed');
    }
}

// Run the seed function
seedDatabase().catch(console.error);