import {
	query
} from './index';
import assert from "assert";

describe("SQL tests", function() {
	it("Basic SELECT tests", () => {
		const numbers = [1, 2, 3]
		assert.deepStrictEqual(query().select().from(numbers).execute(), numbers)
		assert.deepStrictEqual(query().select().execute(), [], 'No FROM clause produces empty array')
		assert.deepStrictEqual(query().from(numbers).execute(), numbers, 'SELECT can be omited')
		assert.deepStrictEqual(query().execute(), [])
		assert.deepStrictEqual(query().from(numbers).select().execute(), numbers, 'The order does not matter')
	});

	it("Basic SELECT and WHERE over objects", () => {
		const persons = [{
			name: 'Peter',
			profession: 'teacher',
			age: 20,
			maritalStatus: 'married'
		},
			{
				name: 'Michael',
				profession: 'teacher',
				age: 50,
				maritalStatus: 'single'
			},
			{
				name: 'Peter',
				profession: 'teacher',
				age: 20,
				maritalStatus: 'married'
			},
			{
				name: 'Anna',
				profession: 'scientific',
				age: 20,
				maritalStatus: 'married'
			},
			{
				name: 'Rose',
				profession: 'scientific',
				age: 50,
				maritalStatus: 'married'
			},
			{
				name: 'Anna',
				profession: 'scientific',
				age: 20,
				maritalStatus: 'single'
			},
			{
				name: 'Anna',
				profession: 'politician',
				age: 50,
				maritalStatus: 'married'
			}
		];

		assert.deepStrictEqual(query().select().from(persons).execute(), persons)

		function profession(person: any) {
			return person.profession;
		}

		// SELECT profession FROM persons
		assert.deepStrictEqual(query().select(profession).from(persons).execute(), ["teacher", "teacher", "teacher", "scientific", "scientific", "scientific", "politician"])
		assert.deepStrictEqual(query().select(profession).execute(), [], 'No FROM clause produces empty array')

		function isTeacher(person: any) {
			return person.profession === 'teacher';
		}

		// SELECT profession FROM persons WHERE profession="teacher"
		assert.deepStrictEqual(query().select(profession).from(persons).where(isTeacher).execute(), ["teacher", "teacher", "teacher"])

		// SELECT * FROM persons WHERE profession="teacher"
		assert.deepStrictEqual(query().from(persons).where(isTeacher).execute(), persons.slice(0, 3))

		function name(person: any) {
			return person.name;
		}

		// SELECT name FROM persons WHERE profession="teacher"
		assert.deepStrictEqual(query().select(name).from(persons).where(isTeacher).execute(), ["Peter", "Michael", "Peter"])
		assert.deepStrictEqual(query().where(isTeacher).from(persons).select(name).execute(), ["Peter", "Michael", "Peter"])
	});

	it("GROUP BY tests", () => {
		var persons = [{
			name: 'Peter',
			profession: 'teacher',
			age: 20,
			maritalStatus: 'married'
		},
			{
				name: 'Michael',
				profession: 'teacher',
				age: 50,
				maritalStatus: 'single'
			},
			{
				name: 'Peter',
				profession: 'teacher',
				age: 20,
				maritalStatus: 'married'
			},
			{
				name: 'Anna',
				profession: 'scientific',
				age: 20,
				maritalStatus: 'married'
			},
			{
				name: 'Rose',
				profession: 'scientific',
				age: 50,
				maritalStatus: 'married'
			},
			{
				name: 'Anna',
				profession: 'scientific',
				age: 20,
				maritalStatus: 'single'
			},
			{
				name: 'Anna',
				profession: 'politician',
				age: 50,
				maritalStatus: 'married'
			}
		];

		function profession(person: any) {
			return person.profession;
		}

//     SELECT * FROM persons GROUPBY profession <- Bad in SQL but possible in JavaScript
		assert.deepStrictEqual(query().select().from(persons).groupBy(profession).execute(), [
			["teacher", [{
				"name": "Peter",
				"profession": "teacher",
				"age": 20,
				"maritalStatus": "married"
			}, {
				"name": "Michael",
				"profession": "teacher",
				"age": 50,
				"maritalStatus": "single"
			}, {
				"name": "Peter",
				"profession": "teacher",
				"age": 20,
				"maritalStatus": "married"
			}]],
			["scientific", [{
				"name": "Anna",
				"profession": "scientific",
				"age": 20,
				"maritalStatus": "married"
			}, {
				"name": "Rose",
				"profession": "scientific",
				"age": 50,
				"maritalStatus": "married"
			}, {
				"name": "Anna",
				"profession": "scientific",
				"age": 20,
				"maritalStatus": "single"
			}]],
			["politician", [{
				"name": "Anna",
				"profession": "politician",
				"age": 50,
				"maritalStatus": "married"
			}]]
		]);

		function isTeacher(person: any) {
			return person.profession === 'teacher';
		}

//     SELECT * FROM persons WHERE profession='teacher' GROUPBY profession
		assert.deepStrictEqual(query().select().from(persons).where(isTeacher).groupBy(profession).execute(), [
			["teacher", [{
				"name": "Peter",
				"profession": "teacher",
				"age": 20,
				"maritalStatus": "married"
			}, {
				"name": "Michael",
				"profession": "teacher",
				"age": 50,
				"maritalStatus": "single"
			}, {
				"name": "Peter",
				"profession": "teacher",
				"age": 20,
				"maritalStatus": "married"
			}]]
		]);

		function professionGroup(group: any) {
			return group[0];
		}

		// SELECT profession FROM persons GROUPBY profession
		assert.deepStrictEqual(query().select(professionGroup).from(persons).groupBy(profession).execute(), ["teacher", "scientific", "politician"])

		function name(person: any) {
			return person.name;
		}

		// SELECT * FROM persons WHERE profession='teacher' GROUPBY profession, name
		assert.deepStrictEqual(query().select().from(persons).groupBy(profession, name).execute(), [
			["teacher", [
				["Peter", [{
					"name": "Peter",
					"profession": "teacher",
					"age": 20,
					"maritalStatus": "married"
				}, {
					"name": "Peter",
					"profession": "teacher",
					"age": 20,
					"maritalStatus": "married"
				}]],
				["Michael", [{
					"name": "Michael",
					"profession": "teacher",
					"age": 50,
					"maritalStatus": "single"
				}]]
			]],
			["scientific", [
				["Anna", [{
					"name": "Anna",
					"profession": "scientific",
					"age": 20,
					"maritalStatus": "married"
				}, {
					"name": "Anna",
					"profession": "scientific",
					"age": 20,
					"maritalStatus": "single"
				}]],
				["Rose", [{
					"name": "Rose",
					"profession": "scientific",
					"age": 50,
					"maritalStatus": "married"
				}]]
			]],
			["politician", [
				["Anna", [{
					"name": "Anna",
					"profession": "politician",
					"age": 50,
					"maritalStatus": "married"
				}]]
			]]
		])

		function age(person: any) {
			return person.age;
		}

		function maritalStatus(person: any) {
			return person.maritalStatus;
		}

		// SELECT * FROM persons WHERE profession='teacher' GROUPBY profession, name, age
		assert.deepStrictEqual(query().select().from(persons).groupBy(profession, name, age, maritalStatus).execute(), [
			["teacher", [
				["Peter", [
					['20', [
						["married", [{
							"name": "Peter",
							"profession": "teacher",
							"age": 20,
							"maritalStatus": "married"
						}, {
							"name": "Peter",
							"profession": "teacher",
							"age": 20,
							"maritalStatus": "married"
						}]]
					]]
				]],
				["Michael", [
					['50', [
						["single", [{
							"name": "Michael",
							"profession": "teacher",
							"age": 50,
							"maritalStatus": "single"
						}]]
					]]
				]]
			]],
			["scientific", [
				["Anna", [
					['20', [
						["married", [{
							"name": "Anna",
							"profession": "scientific",
							"age": 20,
							"maritalStatus": "married"
						}]],
						["single", [{
							"name": "Anna",
							"profession": "scientific",
							"age": 20,
							"maritalStatus": "single"
						}]]
					]]
				]],
				["Rose", [
					['50', [
						["married", [{
							"name": "Rose",
							"profession": "scientific",
							"age": 50,
							"maritalStatus": "married"
						}]]
					]]
				]]
			]],
			["politician", [
				["Anna", [
					['50', [
						["married", [{
							"name": "Anna",
							"profession": "politician",
							"age": 50,
							"maritalStatus": "married"
						}]]
					]]
				]]
			]]
		])

		function professionCount(group: any) {
			return [group[0], group[1].length];
		}

		// SELECT profession, count(profession) FROM persons GROUPBY profession
		assert.deepStrictEqual(query().select(professionCount).from(persons).groupBy(profession).execute(), [
			["teacher", 3],
			["scientific", 3],
			["politician", 1]
		])

		function naturalCompare(value1: any, value2: any) {
			if (value1 < value2) {
				return -1;
			} else if (value1 > value2) {
				return 1;
			} else {
				return 0;
			}
		}

		// SELECT profession, count(profession) FROM persons GROUPBY profession ORDER BY profession
		assert.deepStrictEqual(query().select(professionCount).from(persons).groupBy(profession).orderBy(naturalCompare).execute(), [
			["politician", 1],
			["scientific", 3],
			["teacher", 3]
		])
	});

	it("Number tests", () => {
		function isEven(number: number) {
			return number % 2 === 0;
		}

		function parity(number: number) {
			return isEven(number) ? 'even' : 'odd';
		}

		function isPrime(number: number) {
			if (number < 2) {
				return false;
			}
			var divisor = 2;
			for (; number % divisor !== 0; divisor++);
			return divisor === number;
		}

		function prime(number: number) {
			return isPrime(number) ? 'prime' : 'divisible';
		}

		var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

		// SELECT * FROM numbers
		assert.deepStrictEqual(query().select().from(numbers).execute(), numbers);

		// SELECT * FROM numbers GROUP BY parity
		assert.deepStrictEqual(query().select().from(numbers).groupBy(parity).execute(), [
			["odd", [1, 3, 5, 7, 9]],
			["even", [2, 4, 6, 8]]
		]);

		// SELECT * FROM numbers GROUP BY parity, isPrime
		assert.deepStrictEqual(query().select().from(numbers).groupBy(parity, prime).execute(), [
			["odd", [
				["divisible", [1, 9]],
				["prime", [3, 5, 7]]
			]],
			["even", [
				["prime", [2]],
				["divisible", [4, 6, 8]]
			]]
		]);

		function odd(group: any) {
			return group[0] === 'odd';
		}

		// SELECT * FROM numbers GROUP BY parity HAVING
		assert.deepStrictEqual(query().select().from(numbers).groupBy(parity).having(odd).execute(), [
			["odd", [1, 3, 5, 7, 9]]
		]);

		function descendentCompare(number1: number, number2: number) {
			return number2 - number1;
		}

		// SELECT * FROM numbers ORDER BY value DESC
		assert.deepStrictEqual(query().select().from(numbers).orderBy(descendentCompare).execute(), [9, 8, 7, 6, 5, 4, 3, 2, 1]);

		function lessThan3(number: number) {
			return number < 3;
		}

		function greaterThan4(number: number) {
			return number > 4;
		}

		// SELECT * FROM number WHERE number < 3 OR number > 4
		assert.deepStrictEqual(query().select().from(numbers).where(lessThan3, greaterThan4).execute(), [1, 2, 5, 6, 7, 8, 9]);
	});

	it("Frequency tests", () => {
		var persons = [
			['Peter', 3],
			['Anna', 4],
			['Peter', 7],
			['Michael', 10]
		];

		function nameGrouping(person: any) {
			return person[0];
		}

		function sumValues(value: any) {
			return [value[0], value[1].reduce(function(result: any, person: any) {
				return result + person[1];
			}, 0)];
		}

		function naturalCompare(value1: any, value2: any) {
			if (value1 < value2) {
				return -1;
			} else if (value1 > value2) {
				return 1;
			} else {
				return 0;
			}
		}

		// SELECT name, sum(value) FROM persons ORDER BY naturalCompare GROUP BY nameGrouping
		assert.deepStrictEqual(query().select(sumValues).from(persons).orderBy(naturalCompare).groupBy(nameGrouping).execute(), [
			["Anna", 4],
			["Michael", 10],
			["Peter", 10]
		]);

		var numbers = [1, 2, 1, 3, 5, 6, 1, 2, 5, 6];

		function id(value: any) {
			return value;
		}

		function frequency(group: any) {
			return {
				value: +group[0],
				frequency: group[1].length
			};
		}

		// SELECT number, count(number) FROM numbers GROUP BY number
		assert.deepStrictEqual(query().select(frequency).from(numbers).groupBy(id).execute(), [{
			"value": 1,
			"frequency": 3
		}, {
			"value": 2,
			"frequency": 2
		}, {
			"value": 3,
			"frequency": 1
		}, {
			"value": 5,
			"frequency": 2
		}, {
			"value": 6,
			"frequency": 2
		}]);

		function greatThan1(group: any) {
			return group[1].length > 1;
		}

		function isPair(group: any) {
			return group[0] % 2 === 0;
		}

		// SELECT number, count(number) FROM numbers GROUP BY number HAVING count(number) > 1 AND isPair(number)
		assert.deepStrictEqual(query().select(frequency).from(numbers).groupBy(id).having(greatThan1).having(isPair).execute(), [{
			"value": 2,
			"frequency": 2
		}, {
			"value": 6,
			"frequency": 2
		}]);
	});

	it("Join tests", () => {
		var teachers = [{
			teacherId: '1',
			teacherName: 'Peter'
		},
			{
				teacherId: '2',
				teacherName: 'Anna'
			}
		];


		var students = [{
			studentName: 'Michael',
			tutor: '1'
		},
			{
				studentName: 'Rose',
				tutor: '2'
			}
		];

		function teacherJoin(join: any) {
			return join[0].teacherId === join[1].tutor;
		}

		function student(join: any) {
			return {
				studentName: join[1].studentName,
				teacherName: join[0].teacherName
			};
		}

		// SELECT studentName, teacherName FROM teachers, students WHERE teachers.teacherId = students.tutor
		assert.deepStrictEqual(query().select(student).from(teachers, students).where(teacherJoin).execute(), [{
			"studentName": "Michael",
			"teacherName": "Peter"
		}, {
			"studentName": "Rose",
			"teacherName": "Anna"
		}]);

		var numbers1 = [1, 2];
		var numbers2 = [4, 5];

		assert.deepStrictEqual(query().select().from(numbers1, numbers2).execute(), [
			[1, 4],
			[1, 5],
			[2, 4],
			[2, 5]
		]);

		function tutor1(join: any) {
			return join[1].tutor === "1";
		}

		// SELECT studentName, teacherName FROM teachers, students WHERE teachers.teacherId = students.tutor AND tutor = 1
		assert.deepStrictEqual(query().select(student).from(teachers, students).where(teacherJoin).where(tutor1).execute(), [{
			"studentName": "Michael",
			"teacherName": "Peter"
		}]);
		assert.deepStrictEqual(query().where(teacherJoin).select(student).where(tutor1).from(teachers, students).execute(), [{
			"studentName": "Michael",
			"teacherName": "Peter"
		}]);

	});

	it("Duplication exception tests", () => {
		function checkError(fn: any, duplicate: any) {
			try {
				fn();
				assert.strictEqual(false, false, 'An error should be throw');
			} catch (e) {
				assert.strictEqual(e instanceof Error, true);
				assert.strictEqual((e as any).message, 'Duplicate ' + duplicate);
			}
		}

		function id(value: any) {
			return value;
		}

		checkError(function() {
			query().select().select().execute();
		}, 'SELECT');
		checkError(function() {
			query().select().from([]).select().execute();
		}, 'SELECT');
		checkError(function() {
			query().select().from([]).from([]).execute();
		}, 'FROM');
		checkError(function() {
			query().select().from([]).orderBy(id).orderBy(id).execute();
		}, 'ORDERBY');
		checkError(function() {
			query().select().groupBy(id).from([]).groupBy(id).execute();
		}, 'GROUPBY');
	});
});
