// src/app/dashboard/communication/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';


interface Announcement {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        role: string;
    };
    createdAt: Date;
    priority: 'low' | 'medium' | 'high';
    courseId?: string;
    courseName?: string;
}

interface StudyGroup {
    id: string;
    name: string;
    description: string;
    members: number;
    maxMembers: number;
    courseId: string;
    courseName: string;
    meetingTime?: string;
    isJoined: boolean;
}

export default function CommunicationHub() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'chat' | 'forums' | 'study-groups' | 'announcements'>('chat');
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: '',
        courseId: '',
        maxMembers: 5,
        meetingTime: ''
    });
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        courseId: ''
    });

    useEffect(() => {
        fetchEnrolledCourses();
        fetchAnnouncements();
        fetchStudyGroups();
    }, []);

    const fetchEnrolledCourses = async () => {
        try {
            // Fetch from your API
            // const response = await courseService.getEnrolledCourses();
            // setEnrolledCourses(response);

            // Mock data
            setEnrolledCourses([
                { _id: '1', title: 'Web Development', instructorId: { name: 'John Doe' } },
                { _id: '2', title: 'Data Science', instructorId: { name: 'Jane Smith' } },
                { _id: '3', title: 'Machine Learning', instructorId: { name: 'Bob Wilson' } }
            ]);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchAnnouncements = async () => {
        // Mock data
        setAnnouncements([
            {
                id: '1',
                title: 'Assignment Deadline Extended',
                content: 'The deadline for Assignment 3 has been extended to next Friday.',
                author: { name: 'Prof. Smith', role: 'instructor' },
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
                priority: 'high',
                courseId: '1',
                courseName: 'Web Development'
            },
            {
                id: '2',
                title: 'New Course Materials Available',
                content: 'New lecture slides and resources have been uploaded for Module 5.',
                author: { name: 'Prof. Johnson', role: 'instructor' },
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
                priority: 'medium',
                courseId: '2',
                courseName: 'Data Science'
            }
        ]);
    };

    const fetchStudyGroups = async () => {
        // Mock data
        setStudyGroups([
            {
                id: '1',
                name: 'React Study Group',
                description: 'Weekly meetup to discuss React concepts and projects',
                members: 8,
                maxMembers: 10,
                courseId: '1',
                courseName: 'Web Development',
                meetingTime: 'Wednesdays 6PM',
                isJoined: true
            },
            {
                id: '2',
                name: 'ML Algorithms Practice',
                description: 'Solving ML problems together',
                members: 5,
                maxMembers: 8,
                courseId: '3',
                courseName: 'Machine Learning',
                meetingTime: 'Fridays 7PM',
                isJoined: false
            }
        ]);
    };

    const createStudyGroup = async () => {
        if (!newGroup.name || !newGroup.courseId) return;

        try {
            // API call to create study group
            console.log('Creating study group:', newGroup);
            setShowCreateGroupModal(false);
            setNewGroup({
                name: '',
                description: '',
                courseId: '',
                maxMembers: 5,
                meetingTime: ''
            });
            fetchStudyGroups();
        } catch (error) {
            console.error('Error creating study group:', error);
        }
    };

    const joinStudyGroup = async (groupId: string) => {
        try {
            // API call to join study group
            console.log('Joining study group:', groupId);
            setStudyGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, isJoined: true, members: group.members + 1 }
                    : group
            ));
        } catch (error) {
            console.error('Error joining study group:', error);
        }
    };

    const leaveStudyGroup = async (groupId: string) => {
        try {
            // API call to leave study group
            console.log('Leaving study group:', groupId);
            setStudyGroups(prev => prev.map(group =>
                group.id === groupId
                    ? { ...group, isJoined: false, members: group.members - 1 }
                    : group
            ));
        } catch (error) {
            console.error('Error leaving study group:', error);
        }
    };

    const createAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) return;

        try {
            // API call to create announcement
            console.log('Creating announcement:', newAnnouncement);
            setShowAnnouncementModal(false);
            setNewAnnouncement({
                title: '',
                content: '',
                priority: 'medium',
                courseId: ''
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return styles.priorityHigh;
            case 'medium': return styles.priorityMedium;
            case 'low': return styles.priorityLow;
            default: return '';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Communication Hub</h1>
                    <p className={styles.subtitle}>Connect with your peers and instructors</p>
                </div>

                {/* Quick Stats */}
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <p className={styles.statValue}>12</p>
                            <p className={styles.statLabel}>Active Chats</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className={styles.statValue}>{studyGroups.filter(g => g.isJoined).length}</p>
                            <p className={styles.statLabel}>Study Groups</p>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <div>
                            <p className={styles.statValue}>{announcements.length}</p>
                            <p className={styles.statLabel}>Announcements</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'forums' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('forums')}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Forums
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'study-groups' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('study-groups')}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Study Groups
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'announcements' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    Announcements
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.content}>
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className={styles.chatContainer}>
                        <ChatInterface />
                    </div>
                )}

                {/* Forums Tab */}
                {activeTab === 'forums' && (
                    <div className={styles.forumsContainer}>
                        {enrolledCourses.length > 0 ? (
                            <>
                                <div className={styles.courseSelector}>
                                    <label>Select Course:</label>
                                    <select
                                        value={selectedCourseId || ''}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className={styles.courseSelect}
                                    >
                                        <option value="">Choose a course...</option>
                                        {enrolledCourses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedCourseId ? (
                                    <ForumInterface courseId={selectedCourseId} />
                                ) : (
                                    <div className={styles.emptyState}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                        <p>Select a course to view its forum</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>Enroll in courses to access forums</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Study Groups Tab */}
                {activeTab === 'study-groups' && (
                    <div className={styles.studyGroupsContainer}>
                        <div className={styles.sectionHeader}>
                            <h2>Study Groups</h2>
                            {user?.role === 'student' && (
                                <button
                                    onClick={() => setShowCreateGroupModal(true)}
                                    className={styles.createButton}
                                >
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Group
                                </button>
                            )}
                        </div>

                        <div className={styles.groupsGrid}>
                            {studyGroups.map(group => (
                                <div key={group.id} className={styles.groupCard}>
                                    <div className={styles.groupHeader}>
                                        <h3>{group.name}</h3>
                                        <span className={styles.groupCourse}>{group.courseName}</span>
                                    </div>

                                    <p className={styles.groupDescription}>{group.description}</p>

                                    <div className={styles.groupInfo}>
                                        <div className={styles.groupMeta}>
                      <span>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                          {group.members}/{group.maxMembers} members
                      </span>
                                            {group.meetingTime && (
                                                <span>
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                                                    {group.meetingTime}
                        </span>
                                            )}
                                        </div>

                                        {user?.role === 'student' && (
                                            group.isJoined ? (
                                                <button
                                                    onClick={() => leaveStudyGroup(group.id)}
                                                    className={styles.leaveButton}
                                                >
                                                    Leave Group
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => joinStudyGroup(group.id)}
                                                    className={styles.joinButton}
                                                    disabled={group.members >= group.maxMembers}
                                                >
                                                    {group.members >= group.maxMembers ? 'Full' : 'Join Group'}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}

                            {studyGroups.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>No study groups available</p>
                                    <button
                                        onClick={() => setShowCreateGroupModal(true)}
                                        className={styles.createLink}
                                    >
                                        Create the first group →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Announcements Tab */}
                {activeTab === 'announcements' && (
                    <div className={styles.announcementsContainer}>
                        <div className={styles.sectionHeader}>
                            <h2>Announcements</h2>
                            {user?.role === 'instructor' && (
                                <button
                                    onClick={() => setShowAnnouncementModal(true)}
                                    className={styles.createButton}
                                >
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Announcement
                                </button>
                            )}
                        </div>

                        <div className={styles.announcementsList}>
                            {announcements.map(announcement => (
                                <div key={announcement.id} className={styles.announcementCard}>
                                    <div className={styles.announcementHeader}>
                                        <div>
                                            <h3>{announcement.title}</h3>
                                            <div className={styles.announcementMeta}>
                        <span className={styles.announcementAuthor}>
                          {announcement.author.name}
                        </span>
                                                {announcement.courseName && (
                                                    <span className={styles.announcementCourse}>
                            {announcement.courseName}
                          </span>
                                                )}
                                                <span className={styles.announcementTime}>
                          {formatTimeAgo(announcement.createdAt)}
                        </span>
                                            </div>
                                        </div>
                                        <span className={`${styles.priority} ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                                    </div>

                                    <p className={styles.announcementContent}>
                                        {announcement.content}
                                    </p>
                                </div>
                            ))}

                            {announcements.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p>No announcements yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Study Group Modal */}
            {showCreateGroupModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Create Study Group</h2>
                            <button
                                onClick={() => setShowCreateGroupModal(false)}
                                className={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Group Name</label>
                                <input
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    placeholder="e.g., React Study Group"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    placeholder="What will this group focus on?"
                                    rows={3}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Course</label>
                                <select
                                    value={newGroup.courseId}
                                    onChange={(e) => setNewGroup({ ...newGroup, courseId: e.target.value })}
                                >
                                    <option value="">Select a course</option>
                                    {enrolledCourses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Max Members</label>
                                    <input
                                        type="number"
                                        value={newGroup.maxMembers}
                                        onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) })}
                                        min="2"
                                        max="20"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Meeting Time (Optional)</label>
                                    <input
                                        type="text"
                                        value={newGroup.meetingTime}
                                        onChange={(e) => setNewGroup({ ...newGroup, meetingTime: e.target.value })}
                                        placeholder="e.g., Wednesdays 6PM"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                onClick={() => setShowCreateGroupModal(false)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createStudyGroup}
                                className={styles.submitButton}
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Announcement Modal */}
            {showAnnouncementModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>New Announcement</h2>
                            <button
                                onClick={() => setShowAnnouncementModal(false)}
                                className={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={newAnnouncement.title}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                    placeholder="Announcement title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Content</label>
                                <textarea
                                    value={newAnnouncement.content}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                    placeholder="Write your announcement..."
                                    rows={5}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Priority</label>
                                    <select
                                        value={newAnnouncement.priority}
                                        onChange={(e) => setNewAnnouncement({
                                            ...newAnnouncement,
                                            priority: e.target.value as 'low' | 'medium' | 'high'
                                        })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Course (Optional)</label>
                                    <select
                                        value={newAnnouncement.courseId}
                                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, courseId: e.target.value })}
                                    >
                                        <option value="">All Students</option>
                                        {enrolledCourses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                onClick={() => setShowAnnouncementModal(false)}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createAnnouncement}
                                className={styles.submitButton}
                            >
                                Post Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}