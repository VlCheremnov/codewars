type FunctionType<T = any> = (...args: any) => T

class QueryBuilder {

	private whereFn: FunctionType[][] = []
	private havingFn: FunctionType[] = []
	private selectFn?: FunctionType
	private groupByFn?: FunctionType[]
	private orderByFn?: FunctionType

	private fromArrays?: any[][]

	/* Выбор поля */
	select (fn?: FunctionType) {
		if (this.selectFn) {
			throw new Error('Duplicate SELECT')
		}

		if (fn) {
			this.selectFn = fn
		}

		return this
	}
	/* Массив данных */
	from (...arrays: any[][]) {
		if (this.fromArrays) {
			throw new Error('Duplicate FROM')
		}

		this.fromArrays = arrays

		return this
	}
	/* Выборка */
	where (...args: FunctionType[]) {
		this.whereFn[this.whereFn.length] = args;
		return this
	}
	/* Группируем и возвращаем [ { [key]: data[] }, ... ] */
	orderBy (fn?: FunctionType) {
		if (this.orderByFn) {
			throw new Error('Duplicate ORDERBY')
		}

		if (fn) {
			this.orderByFn = fn
		}

		return this
	}
	/* Сортировка */
	groupBy (...args: FunctionType[]) {
		if (this.groupByFn) {
			throw new Error('Duplicate GROUPBY')
		}

		this.groupByFn = [...args]

		return this
	}

	groupDocuments (documents: any[], groupByFn: FunctionType[], i: number = 0) {
		const mapDocuments: { [key: string]: any } = {}

		const fn = groupByFn[i]

		documents.forEach((document: any) => {
			const group = fn(document)

			if (!mapDocuments[group]) {
				mapDocuments[group] = []
			}

			mapDocuments[group].push(document)
		})

		if (groupByFn.length > i + 1) {
			i++

			Object.keys(mapDocuments).forEach((key: string) => {
				mapDocuments[key] = this.groupDocuments(mapDocuments[key], groupByFn, i)
			})
		}

		return Object.entries(mapDocuments)
	}

	/* Выборка на группу */
	having (...args: FunctionType[]) {
		this.havingFn.push(...args)
		return this
	}
	execute () {

		if (!this.fromArrays?.length) {
			return []
		}

		let documents: any[] = []

		if (this.fromArrays.length === 1) {
			documents = JSON.parse(JSON.stringify(this.fromArrays[0]))
		} else {
			const fromArrays = this.fromArrays

			for (let i = 0; i < fromArrays.length; i++) {
				const array_documents = fromArrays[i]


				array_documents.forEach((document) => {
					for (let j = i + 1; j < fromArrays.length; j++) {
						const next_array_documents = fromArrays[j]
						next_array_documents.forEach((next_document) => {
							documents.push([document, next_document])
						})
					}
				})
			}
		}


		if (this.whereFn?.length) {
			this.whereFn.forEach((fnList) => {
				documents = documents.filter((document) => {
					return fnList.find((fn) => fn(document))
				})
			})
		}

		if (this.groupByFn) {
			documents = this.groupDocuments(documents, this.groupByFn);
		}

		if (this.havingFn?.length) {
			this.havingFn.forEach((fn) => {
				documents = documents.filter(fn)
			})
		}

		if (this.selectFn) {
			documents = documents.map(this.selectFn)
		}

		if (this.orderByFn) {
			documents = documents.sort(this.orderByFn)
		}

		return documents
	}
}

const query = () => {
	return new QueryBuilder()
}


const teachers = [
	{
		teacherId: '1',
		teacherName: 'Peter'
	},
	{
		teacherId: '2',
		teacherName: 'Anna'
	}
];


const students = [
	{
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
const query_1 = query().select(student).from(teachers, students).where(teacherJoin).execute()

const numbers1 = [1, 2];
const numbers2 = [4, 5];

const query_2 = query().select().from(numbers1, numbers2).execute()

function tutor1(join: any) {
	return join[1].tutor === "1";
}

const query_3 = query().select(student).from(teachers, students).where(teacherJoin).where(tutor1).execute()
const query_4 = query().select(student).where(teacherJoin).where(tutor1).from(teachers, students).execute()

console.log('query_1')
console.dir(query_1, { depth: null })
console.log('query_2')
console.dir(query_2, { depth: null })
console.log('query_3')
console.dir(query_3, { depth: null })
console.log('query_4')
console.dir(query_4, { depth: null })
