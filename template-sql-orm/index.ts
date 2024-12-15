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

export const query = () => {
	return new QueryBuilder()
}
