const advancedResults = (model,populate) => async(req,res,next) => {
    let query;
    const reqQuery = {...req.query}
    console.log(reqQuery);
    
    /*
    //Fields to exclude Brad有做這些，但就算沒做，好像也不會影響程式運作
    const removeFields = ['select','sort','page','limit']

   
    //loop over removeFeilds and delete them from reqQuery

    removeFields.forEach(param => delete reqQuery[param])
    console.log('banana')
    console.log(reqQuery)
    */



    //create query string
    let queryStr = JSON.stringify(reqQuery);
    //console.log(queryStr)


    //create operators
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    //Finding resource
    query = model.find(JSON.parse(queryStr))
   
    //Select Fields
 
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        console.log('car')
        console.log(fields)
        query = query.select(fields)
    }

    //Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        console.log(sortBy)
        console.log('sort')
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total= await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate);
    }


    //Excuting query
    const results = await query

    //Pagination result
    const pagination = {};
    if(endIndex < total){
        pagination.nextt = {
            page: page + 1,
            limit
        }
    }
    
    if(startIndex > 0){
        pagination.prevv = {
            page: page - 1,
            limit
        }
    }



    //advancedResults
    res.advancedResults = {
        success:true,
        count: results.length,
        pagination,
        data: results
    }


    next();
}

module.exports = advancedResults;
