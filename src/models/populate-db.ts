import * as dotenv from "dotenv";
const result = dotenv.config();

import 'reflect-metadata';
import { COURSES } from './db-data';
import { AppDataSource } from '../data-source';
import { DeepPartial } from "typeorm";
import { Course } from "./course";
import { Lesson } from "./lesson";

async function populateDb() {
  await AppDataSource.initialize();
  console.log(`Database connection ready.`);

  const courses = Object.values(COURSES) as DeepPartial<Course>[];
  const courseRepository = AppDataSource.getRepository(Course);
  const lessonRepository = AppDataSource.getRepository(Lesson);

  for (let courseData of courses) {
    console.log(`Inserting course ${courseData.title}`);
    const course = courseRepository.create(courseData);
    await courseRepository.save(course);

    for (let lessonData of courseData.lessons) {      
      console.log(`Inserting lesson ${lessonData.title}`);
      const lesson = lessonRepository.create(lessonData);
      lesson.course = course;
      await lessonRepository.save(lesson);
    }
  }

  const totalCourses = await courseRepository
    .createQueryBuilder()
    .getCount();

  const totalLessons = await lessonRepository
    .createQueryBuilder()
    .getCount();

  console.log(`Data Inserted - courses ${totalCourses}, lessons ${totalLessons}`);
}

populateDb()
  .then(() => {
    console.log(`Finished populating database, exiting!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`Error populating database.`, err);
  });