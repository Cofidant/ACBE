class QueryHandler{

    constructor(query,queryString,defaultSort){
        this.query = query;
        this.queryString = queryString;
        this.defaultSort = defaultSort;
    }

    filter(){
        let queryParam = {...this.queryString};
        const excluded = ["page","sort","limit","fields"];
        excluded.forEach(param => delete queryParam[param]);
        let queryStr = JSON.stringify(queryParam);

        //queryStr = queryStr.replace(/\/.*\//g, match => `{$regex:${match}}`);
        queryParam = JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, match => `$${match}`));
        
        //handle search for the following fields using regex
        ['title','name'].forEach(field => {
            if(queryParam[field])
                queryParam[field] = new RegExp(".*" + queryParam[field] + ".*","i");
        });
        
        /* console.log(queryParam)
        for(let field in queryParam){
            console.log(queryParam[field])
            if(queryParam[field].matches(/^{.*}$/))
                queryParam[field] = JSON.parse(queryParam[field]);
        }
        console.log(queryParam) */
        
        this.query = this.query.find(queryParam);
        return this;
    }

    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        }else{
            //default sort
            this.query = this.query.sort(this.defaultSort);
        }
        return this;
    }

    project(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate(){
        if(this.queryString.page || this.queryString.limit){
            const page = (this.queryString.page - 1)>0?(this.queryString.page - 1):0;
            let limit = this.queryString.limit*1 || 10;
            this.query = this.query.skip(page*limit).limit(limit);
        }
        return this;
    }

    process(){
        return this.filter().sort().project().paginate().query;
    }

}

module.exports = QueryHandler