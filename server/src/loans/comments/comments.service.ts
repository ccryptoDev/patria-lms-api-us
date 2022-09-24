import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DatabaseSearchService } from '../../database-search/database-search.service';

import { LoggerService } from '../../logger/logger.service';
import { Comments, CommentsDocument } from './comments.schema';
import { AddCommentDto } from './validation/add-comment.dto';
import GetAllCommentsByScreenTrackingDto from './validation/get-all-comments-by-screen-tracking.dto';

const ObjectId = mongoose.Types.ObjectId;
@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comments.name)
    private readonly commentsModel: Model<CommentsDocument>,
    private readonly databaseSearchService: DatabaseSearchService,
    private readonly logger: LoggerService,
  ) {}

  async addComment(addCommentDto: AddCommentDto, requestId: string) {
    const { subject, comment, createdBy, screenTrackingId } = addCommentDto;
    this.logger.log(
      'Adding comments with params:',
      `${CommentsService.name}#addComment`,
      requestId,
      addCommentDto,
    );

    const createdComment = await this.commentsModel.create({
      subject,
      comment,
      createdBy,
      screenTracking: screenTrackingId,
    });

    const response = {
      commentId: createdComment._id,
    };
    this.logger.log(
      'Comment added:',
      `${CommentsService.name}#addComment`,
      requestId,
      createdComment,
    );

    return response;
  }

  async getAllCommentsByScreenTrackingId(
    screenTrackingId: string,
    getAllCommentsByScreenTrackingDto: GetAllCommentsByScreenTrackingDto,
    requestId: string,
  ) {
    this.logger.log(
      'Getting all comments by screen tracking id with params:',
      `${CommentsService.name}#getAllLogActivities`,
      requestId,
      { screenTrackingId, getAllCommentsByScreenTrackingDto },
    );
    const { page, perPage } = getAllCommentsByScreenTrackingDto;
    let matchCriteria = { screenTracking: new ObjectId(screenTrackingId) };

    if (getAllCommentsByScreenTrackingDto.search) {
      const mappedDataFields: {
        data: string;
        dataType: 'string' | 'currency';
      }[] = this.processAllLogActivitiesDataFields();
      matchCriteria = this.databaseSearchService.processFiltering(
        matchCriteria,
        getAllCommentsByScreenTrackingDto.search,
        mappedDataFields,
      );
    }

    const response = (
      await this.commentsModel.aggregate([
        { $match: matchCriteria },
        ...this.getPaginationAggregation(page, perPage),
      ])
    )[0] ?? { rows: [], totalRows: 0 };

    response.rows = response.rows.map(
      ({ _id, createdAt, createdBy, subject, comment }: any) => {
        return {
          id: _id,
          dateCreated: createdAt,
          subject,
          createdBy,
          comment,
        };
      },
    );
    this.logger.log(
      'Got comments by screen tracking id:',
      `${CommentsService.name}#getAllCommentsByScreenTrackingId`,
      requestId,
      response,
    );

    return response;
  }

  processAllLogActivitiesDataFields(): {
    data: string;
    dataType: 'string';
  }[] {
    const dataFields: {
      data: string;
      dataType: 'string';
    }[] = [
      {
        data: 'subject',
        dataType: 'string',
      },
      {
        data: 'comments',
        dataType: 'string',
      },
      {
        data: 'createdBy',
        dataType: 'string',
      },
    ];

    return dataFields;
  }

  getPaginationAggregation(page: number, perPage: number) {
    return [
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: null,
          totalRows: {
            $sum: 1,
          },
          rows: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $unwind: '$rows',
      },
      {
        $skip: (page - 1) * perPage,
      },
      {
        $limit: perPage,
      },
      {
        $group: {
          _id: null,
          totalRows: { $first: '$totalRows' },
          rows: {
            $push: '$rows',
          },
        },
      },
      {
        $project: { _id: 0 },
      },
    ];
  }
}
