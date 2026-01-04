import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CreateForumDto } from "../dto's/forum-dto's";
import { Forum } from "../database/forum";
import { Model, Types } from "mongoose";
import { AuditLogService } from "../audit-log/audit-logging.service";
import { Logs } from "../audit-log/Logs";

type Page = { page?: number; limit?: number; q?: string };

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(Forum.name) private readonly forumModel: Model<Forum>,
        private readonly audit: AuditLogService,
    ) {}

    async createForum(createForumDto: CreateForumDto) {
        const forum = new this.forumModel({
            courseId: createForumDto.courseId,
            threads: createForumDto.threads || [],
        });
        return forum.save();
    }

    async getForumByCourseId(courseId: string) {
        const forum = await this.forumModel.findOne({ courseId });
        if (!forum) throw new NotFoundException('Forum not found');
        return forum;
    }

    async addThread(forumId: string, title: string, createdBy: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        (forum.threads as any[]).push({
            title,
            createdBy: new Types.ObjectId(createdBy),
            createdAt: new Date(),
            posts: [],
        });

        await forum.save();
        return { message: 'Thread added successfully' };
    }

    async addPost(forumId: string, threadId: string, content: string, author: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = (forum.threads as any[]).find((t: any) => String(t._id) === threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        // Edge case: Content validation
        if (!content || content.trim().length === 0) {
            throw new BadRequestException('Post content cannot be empty');
        }

        // Edge case: Max content length
        if (content.length > 10000) {
            throw new BadRequestException('Post is too long (max 10000 characters)');
        }

        thread.posts.push({
            content: content.trim(),
            author: new Types.ObjectId(author),
            timestamp: new Date(),
            likes: [],
        });

        await forum.save();

        // Audit log
        await this.audit.log(Logs.FORUM_POST_CREATED, author, {
            forumId,
            threadId,
            courseId: forum.courseId?.toString(),
        });

        return { message: 'Post added successfully' };
    }

    async getForumByCourse(courseId: string) {
        return this.forumModel.findOne({ courseId: new Types.ObjectId(courseId) })
            .populate('threads.createdBy threads.posts.author')
            .lean();
    }

    async deletePost(courseId: string, threadId: string, postId: string, userId: string) {
        const forum = await this.getForumByCourseId(courseId);

        const thread = (forum.threads as any[]).find((t: any) => String(t._id) === threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        const postIndex = thread.posts.findIndex((p: any) => String(p._id) === postId);
        if (postIndex === -1) throw new NotFoundException('Post not found');

        const post = thread.posts[postIndex];
        if (String(post.author) !== userId) {
            throw new ForbiddenException('You are not allowed to delete this post');
        }

        thread.posts.splice(postIndex, 1);
        await forum.save();
        return forum;
    }

    async likeOrUnlikePost(forumId: string, threadId: string, postId: string, userId: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = (forum.threads as any[]).find((t: any) => String(t._id) === threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        const post = thread.posts.find((p: any) => String(p._id) === postId);
        if (!post) throw new NotFoundException('Post not found');

        const userObjectId = new Types.ObjectId(userId);
        const likeIndex = post.likes.findIndex((id: any) => String(id) === userId);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userObjectId);
        }

        await forum.save();
        return { liked: likeIndex === -1, likeCount: post.likes.length };
    }

    async deleteThread(forumId: string, threadId: string, userId: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const threadIndex = (forum.threads as any[]).findIndex((t: any) => String(t._id) === threadId);
        if (threadIndex === -1) throw new NotFoundException('Thread not found');

        const thread = (forum.threads as any[])[threadIndex];
        if (String(thread.createdBy) !== userId) {
            throw new ForbiddenException('Only the thread creator can delete this thread');
        }

        (forum.threads as any[]).splice(threadIndex, 1);
        await forum.save();
        return { message: 'Thread deleted successfully' };
    }

    async listThreads(forumId: string, { page = 1, limit = 20, q }: { page?: number; limit?: number; q?: string }) {
        const forum: any = await this.forumModel.findById(forumId).lean();
        if (!forum) throw new NotFoundException('Forum not found');

        const term = q?.trim()?.toLowerCase();
        let threads: any[] = forum.threads ?? [];

        if (term) {
            threads = threads.filter(t => (t.title ?? '').toLowerCase().includes(term));
        }

        const total = threads.length;

        threads.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

        const start = (page - 1) * limit;
        const items = threads.slice(start, start + limit);

        return { items, total, page, limit };
    }

    async listPosts(forumId: string, threadId: string, { page = 1, limit = 20 }: { page?: number; limit?: number }) {
        const forum: any = await this.forumModel.findById(forumId).lean();
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = (forum.threads ?? []).find((t: any) => String(t._id) === threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        const posts: any[] = thread.posts ?? [];
        const total = posts.length;

        posts.sort((a, b) => new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime());

        const start = (page - 1) * limit;
        const items = posts.slice(start, start + limit);

        return { items, total, page, limit };
    }

    async editThreadTitle(forumId: string, threadId: string, newTitle: string, userId: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = (forum.threads as any[]).find((t: any) => String(t._id) === threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        // Only thread creator can edit
        if (String(thread.createdBy) !== userId) {
            throw new ForbiddenException('Only the thread creator can edit the title');
        }

        // Validate title
        if (!newTitle || newTitle.trim().length === 0) {
            throw new BadRequestException('Title cannot be empty');
        }

        if (newTitle.length > 200) {
            throw new BadRequestException('Title is too long (max 200 characters)');
        }

        thread.title = newTitle.trim();
        await forum.save();

        return { message: 'Thread title updated successfully', title: thread.title };
    }

    async searchThreads(forumId: string, keyword: string) {
        const forum: any = await this.forumModel.findById(forumId).lean();
        if (!forum) throw new NotFoundException('Forum not found');

        if (!keyword || keyword.trim().length === 0) {
            return { items: forum.threads ?? [], total: (forum.threads ?? []).length };
        }

        const term = keyword.trim().toLowerCase();
        const threads = (forum.threads ?? []).filter((t: any) => {
            const titleMatch = (t.title ?? '').toLowerCase().includes(term);
            const postsMatch = (t.posts ?? []).some((p: any) =>
                (p.content ?? '').toLowerCase().includes(term)
            );
            return titleMatch || postsMatch;
        });

        return { items: threads, total: threads.length, keyword };
    }
}
