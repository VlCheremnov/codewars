type FunctionType<T = any> = (...args: any) => T

class QueryBuilder {

	private whereFn: FunctionType[][] = []
	private havingFn: FunctionType[] = []
	private selectFn?: FunctionType
	private groupByFn?: FunctionType[]
	private orderByFn?: FunctionType

	private documents?: any[][]

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
		if (this.documents) {
			throw new Error('Duplicate FROM')
		}

		if (arrays.length === 1) {
			this.documents = JSON.parse(JSON.stringify(arrays[0]))
		} else {
			this.documents = []

			for (let i = 0; i < arrays.length; i++) {
				const array_documents = arrays[i]

				array_documents.forEach((document) => {
					for (let j = i + 1; j < arrays.length; j++) {
						const next_array_documents = arrays[j]
						next_array_documents.forEach((next_document) => {
							if (this.documents) {
								this.documents.push([document, next_document])
							}
						})
					}
				})
			}
		}

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
		const mapDocuments: Map<string | number, any> = new Map()

		const fn = groupByFn[i]

		documents.forEach((document: any) => {
			const group = fn(document)

			if (!mapDocuments.has(group)) {
				mapDocuments.set(group, [])
			}

			mapDocuments.get(group).push(document)
		})

		if (groupByFn.length > i + 1) {
			i++

			Array.from(mapDocuments.keys()).forEach((key) => {
				mapDocuments.set(key, this.groupDocuments(mapDocuments.get(key), groupByFn, i))
			})
		}

		return Array.from(mapDocuments.entries())
	}

	/* Выборка на группу */
	having (...args: FunctionType[]) {
		this.havingFn.push(...args)
		return this
	}
	execute () {

		if (!this.documents?.length) {
			return []
		}

		let documents: any[] = this.documents


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
