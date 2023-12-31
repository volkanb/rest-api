import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger';
import { AppDataSource } from '../data-source';
import { Course } from '../models/course';
import { Lesson } from '../models/lesson';
import { isInteger } from '../utils';

/**
 * curl -X DELETE http://localhost:9000/api/courses/77
 */

export async function deleteCourseAndLessons(request: Request, response: Response, next: NextFunction) {
  try {
    logger.debug(`Called deleteCourseAndLessons()`);

    const courseId = request.params.courseId;

    if(!isInteger(courseId)) {
      throw `Invalid courseId ${courseId}`;
    }

    await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Lesson)
          .where("courseId = :courseId", {courseId})
          .execute();

        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Course)
          .where("id = :courseId", {courseId})
          .execute();
      }
    );

    response.status(200).json({
      message: `Course deleted successfully ${courseId}`
    });

  } catch(error) {
    logger.error(`Error calling deleteCourseAndLessons()`);
    return next(error);
  }
}