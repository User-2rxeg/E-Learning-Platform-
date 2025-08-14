import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {Forum, ForumDocument,} from '../../Database/Forum';
//import { CreateForumDto, UpdateForumDto } from '../DTO/ForumDTO;
import { UserRole } from '../../Database/User';
import {CreateForumDto} from "../../DTO/ForumDTO";

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(Forum.name) private readonly forumModel: Model<ForumDocument>,
    ) {}

    async createForum(createForumDto: CreateForumDto) {
        const forum = new this.forumModel({
            courseId: createForumDto.courseId,
            threads: createForumDto.threads || [],
        });
        return forum.save();
    }

    async getForumByCourseId(courseId: string) {
        const forum = await this.forumModel.findOne({ courseId }).exec();
        if (!forum) throw new NotFoundException('Forum not found');
        return forum;
    }

    async addThread(forumId: string, title: string, createdBy: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        forum.threads.push({
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

        const thread = forum.threads.id(threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        thread.posts.push({
            content,
            author: new Types.ObjectId(author),
            timestamp: new Date(),
            likes: [],
        });

        await forum.save();
        return { message: 'Post added successfully' };
    }

    async likePost(courseId: string, threadId: string, postId: string, userId: string) {
        const forum = await this.getForumByCourseId(courseId);

        const thread = forum.threads.id(threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        const post = thread.posts.id(postId);
        if (!post) throw new NotFoundException('Post not found');

        const alreadyLiked = post.likes.includes(new Types.ObjectId(userId));
        if (alreadyLiked) {
            throw new ForbiddenException('You have already liked this post');
        }

        post.likes.push(new Types.ObjectId(userId));
        await forum.save();
        return forum;
    }

    async getForumByCourse(courseId: string) {
        return this.forumModel.findOne({ courseId: new Types.ObjectId(courseId) }).populate('threads.createdBy threads.posts.author');
    }

    async deletePost(courseId: string, threadId: string, postId: string, userId: string) {
        const forum = await this.getForumByCourseId(courseId);

        const thread = forum.threads.id(threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        const post = thread.posts.id(postId);
        if (!post) throw new NotFoundException('Post not found');

        if (post.author.toString() !== userId) {
            throw new ForbiddenException('You are not allowed to delete this post');
        }

        thread.posts.pull(post._id);
        await forum.save();
        return forum;
    }


    async likeOrUnlikePost(forumId: string, threadId: string, postId: string, userId: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = forum.threads.id(threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        const post = thread.posts.id(postId);
        if (!post) throw new NotFoundException('Post not found');

        const userObjectId = new Types.ObjectId(userId);

        const hasLiked = post.likes.some((id: Types.ObjectId) => id.equals(userObjectId));

        if (hasLiked) {
            post.likes = post.likes.filter((id: Types.ObjectId) => !id.equals(userObjectId));
        } else {
            post.likes.push(userObjectId);
        }

        await forum.save();

        return {
            message: hasLiked ? 'Post unliked' : 'Post liked',
            likeCount: post.likes.length,
        };
    }

    async searchThreads(forumId: string, keyword: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const matchingThreads = forum.threads.filter(thread =>
            thread.title.toLowerCase().includes(keyword.toLowerCase())
        );

        return matchingThreads;
    }

    async deleteThread(forumId: string, threadId: string, userId: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = forum.threads.id(threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        if (thread.createdBy.toString() !== userId) {
            throw new ForbiddenException('You are not allowed to delete this thread');
        }

        forum.threads.pull(threadId);// <-- This will delete the subdocument
        await forum.save();

        return { message: 'Thread deleted successfully' };
    }

    async editThreadTitle(forumId: string, threadId: string, newTitle: string, userId: string) {
        const forum = await this.forumModel.findById(forumId);
        if (!forum) throw new NotFoundException('Forum not found');

        const thread = forum.threads.id(threadId);
        if (!thread) throw new NotFoundException('Thread not found');

        if (thread.createdBy.toString() !== userId) {
            throw new ForbiddenException('You are not allowed to edit this thread');
        }

        thread.title = newTitle;  // ✅ Modify the subdocument
        await forum.save();

        return { message: 'Thread title updated successfully' };
    }


}
