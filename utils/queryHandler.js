class QueryHandler {
  constructor(query, queryString, defaultSort) {
    this.query = query
    this.queryString = queryString
    this.defaultSort = defaultSort
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

    this.query = this.query.find(queryParam).clone()
    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy).clone()
    } else {
      //default sort
      this.query = this.query.sort(this.defaultSort).clone()
    }
    return this
  }

  project() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      this.query = this.query.select(fields).clone()
    } else {
      this.query = this.query.select('-__v').clone()
    }
    return this
  }

  paginate() {
    if (this.queryString.page || this.queryString.limit) {
      const page = this.queryString.page - 1 > 0 ? this.queryString.page - 1 : 0
      let limit = this.queryString.limit * 1 || 10
      this.query = this.query
        .skip(page * limit)
        .limit(limit)
        .clone()
    }
    return this
  }

  process() {
    return this.filter().sort().project().paginate().query
  }
}

module.exports = QueryHandler
