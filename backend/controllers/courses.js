"use strict";

const coursesRouter = require("express").Router();
const dbConn = require("../utils/db");

coursesRouter.get("/", async (request, response) => {
    const courses = await dbConn.query("SELECT * FROM course");
    return response.json(courses);
});

coursesRouter.get("/count", async (request, response) => {
    const courseCount = await dbConn.query('SELECT COUNT(*) as count FROM course');
    return response.json(courseCount[0].count);
});

coursesRouter.get("/:id", async (request, response) => {
    const { id } = request.params;

    if (!id instanceof Number || id % 1 !== 0) {
        return response.status(400).json({ error: "'id' must be a number." });
    }

    const courseList = await dbConn.query("SELECT * FROM course WHERE id=?", [
        id,
    ]);

    if (courseList.length === 0) {
        return response
            .status(404)
            .json({ error: `Course with id ${id} not found` });
    }

    const [course] = courseList;

    return response.json(course);
});

coursesRouter.get("/:id/sessions", async (request, response) => {
    const { id } = request.params;

    if (!id instanceof Number || id % 1 !== 0) {
        return response.status(400).json({ error: "'id' must be a number." });
    }

    const courseList = await dbConn.query(
        "SELECT id, title, code, department_id FROM course WHERE id=?",
        [id]
    );

    if (courseList.length === 0) {
        return response
            .status(404)
            .json({ error: `Course with id ${id} not found` });
    }

    const [course] = courseList;

    const query = `SELECT session_id, start_year, season, 
    instructor_id, name instructor_name, designation instructor_designation, 
    instructor.department_id instructor_dept_id
    FROM teaches 
    JOIN session ON session.id = session_id 
    JOIN course ON course_id = course.id 
    JOIN instructor ON instructor_id = instructor.id 
    WHERE course_id=?;`;

    const sessions = await dbConn.query(query, [id]);

    return response.json(sessions);
});

coursesRouter.get("/:id/sessions/:session_id", async (request, response) => {
    const { id, session_id } = request.params;

    if (!id instanceof Number || id % 1 !== 0) {
        return response.status(400).json({ error: "'id' must be a number." });
    }

    if (!session_id) {
        return response
            .status(400)
            .json({ error: "Missing parameter session_id" });
    }

    if (!session_id instanceof Number || session_id % 1 !== 0) {
        return response
            .status(400)
            .json({ error: "'session_id' must be a number." });
    }

    const courseList = await dbConn.query("SELECT * FROM course WHERE id=?", [
        id,
    ]);

    if (courseList.length === 0) {
        return response
            .status(404)
            .json({ error: `Course with id ${id} not found` });
    }

    const [course] = courseList;

    const sessionList = await dbConn.query(
        "SELECT id session_id, start_year, season FROM session WHERE id=?",
        [session_id]
    );

    if (sessionList.length === 0) {
        return response
            .status(404)
            .json({ error: `Session with id ${session_id} not found` });
    }

    const [session] = sessionList;

    const instructorQuery = `SELECT instructor_id, 
    name instructor_name, 
    designation instructor_designation, 
    instructor.department_id instructor_dept_id 
    FROM teaches 
    JOIN session ON session.id = session_id 
    JOIN course ON course_id = course.id 
    JOIN instructor ON instructor_id = instructor.id
    WHERE course_id=? AND session_id=?;`;

    const instructors = await dbConn.query(instructorQuery, [id, session_id]);

    if (instructors.length === 0) {
        return response.status(404).json({
            error: "No instructors teaching the course in this session",
        });
    }

    const studentsQuery = `SELECT student.roll, student.name, student.email, 
    student.programme_id, programme.degree, programme.name programme_name, 
    programme.department_id, taught_by instructor_id, 
    instructor.name instructor_name,
    instructor.designation instructor_designation, 
    instructor.department_id instructor_dept_id
    FROM takes 
    JOIN student ON student.roll = student_roll 
    JOIN instructor ON taught_by = instructor.id 
    JOIN course ON course_id = course.id
    JOIN session ON session_id = session.id
    JOIN programme ON student.programme_id = programme.id 
    WHERE course_id=? AND session_id=?;`;

    const students = await dbConn.query(studentsQuery, [id, session_id]);

    return response.json({
        instructors,
        students,
    });
});

coursesRouter.post("/", async (request, response) => {
    if (!request.administrator) {
        return response.status(403).end();
    }

    let { department_id, code, title } = request.body;

    if (!code) {
        return response.status(400).json({
            error: "code missing in request body",
        });
    }

    if (!title) {
        return response.status(400).json({
            error: "title missing in request body",
        });
    }

    if (!department_id) {
        return response.status(400).json({
            error: "department_id missing in request body",
        });
    }

    code = code.trim();
    title = title.trim();

    if (!title || title.length < 2) {
        return response.status(400).json({
            error: "title cannot be less than 2 characters long",
        });
    }

    if (!code || code.length < 2) {
        return response.status(400).json({
            error: "code cannot be less than 2 characters long",
        });
    }

    if (!department_id instanceof Number || department_id % 1 !== 0) {
        return response.status(400).json({
            error: "department_id has to be a number",
        });
    }

    const department = await dbConn.query(
        "SELECT * FROM department WHERE id=?",
        [department_id]
    );
    if (department.length === 0) {
        return response.status(400).json({
            error: "Invalid department_id",
        });
    }

    const res = await dbConn.query(
        "INSERT INTO course (title, code, department_id) VALUES (?, ?, ?)",
        [title, code, department_id]
    );
    return response.status(201).json({
        id: res.insertId,
    });
});

coursesRouter.put("/:id", async (request, response) => {
    if (!request.administrator) {
        return response.status(403).end();
    }

    const { id } = request.params;
    let { title, code, department_id } = request.body;

    if (!code) {
        return response.status(400).json({
            error: "code missing in request body",
        });
    }

    if (!title) {
        return response.status(400).json({
            error: "title missing in request body",
        });
    }

    if (!department_id) {
        return response.status(400).json({
            error: "department_id missing in request body",
        });
    }

    code = code.trim();
    title = title.trim();

    if (!title || title.length < 2) {
        return response.status(400).json({
            error: "title cannot be less than 2 characters long",
        });
    }

    if (!code || code.length < 2) {
        return response.status(400).json({
            error: "code cannot be less than 2 characters long",
        });
    }

    if (!department_id instanceof Number || department_id % 1 !== 0) {
        return response.status(400).json({
            error: "department_id has to be a number",
        });
    }

    const department = await dbConn.query(
        "SELECT * FROM department WHERE id=?",
        [department_id]
    );
    if (department.length === 0) {
        return response.status(400).json({
            error: "Invalid department_id",
        });
    }

    await dbConn.query(
        "UPDATE course SET title=?, code=?, department_id=? WHERE id=?",
        [title, code, department_id, id]
    );
    return response.status(200).end();
});

coursesRouter.delete("/:id", async (request, response) => {
    if (!request.administrator) {
        return response.status(403).end();
    }
    const { id } = request.params;

    const courseWithId = await dbConn.query("SELECT * FROM course WHERE id=?", [
        id,
    ]);
    if (courseWithId.length == 0) {
        return response.status(404).json({ error: "No such course" }).end();
    }

    await dbConn.query("DELETE FROM course WHERE id=?", [id]);
    return response.status(204).end();
});

module.exports = coursesRouter;
