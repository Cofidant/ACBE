class QueryHandler {
  constructor(Model, queryString, defaultSort) {
    this.Model = Model
    this.queryString = queryString
    this.defaultSort = defaultSort || '-createdAt _id'
  }

  filter() {
    let queryParam = { ...this.queryString }
    const excluded = ['page', 'sort', 'limit', 'fields']
    excluded.forEach((param) => delete queryParam[param])
    let queryStr = JSON.stringify(queryParam)

    queryParam = JSON.parse(
      queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, (match) => `$${match}`)
    )

    //handle search for the following fields using regex
    ;['title', 'name'].forEach((field) => {
      if (queryParam[field])
        queryParam[field] = new RegExp('.*' + queryParam[field] + '.*', 'i')
    })

    return queryParam
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort
      if (sortBy instanceof Array) sortBy = sortBy.join(' ')
      else sortBy = sortBy.split(',').join(' ')
      return sortBy
    } else {
      //default sort
      return this.defaultSort
    }
  }

  project() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      return fields
    } else {
      return '-__v'
    }
  }

  paginate() {
    if (this.queryString.page || this.queryString.limit) {
      const page = this.queryString.page - 1 > 0 ? this.queryString.page - 1 : 0
      let limit = this.queryString.limit * 1 || 10
      return [page, limit]
    }
    return [0, 100]
  }

  async process() {
    const query = this.filter()
    const fields = this.project()
    const sort = this.sort()
    const paginate = this.paginate()
    let results = []
    try {
      results = await this.Model.find(query)
        .select(fields)
        .skip(paginate[0] * paginate[1])
        .limit(paginate[1])
        .sort(sort)
    } catch (error) {
      console.log('Error Processing Query String >>>', error)
    } finally {
      return results
    }
  }
}

module.exports = QueryHandler
