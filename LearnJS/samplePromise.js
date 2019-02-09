let samplePromise = new Promise(function(resolve, reject)  {
    if(1==1){
        setTimeout(() => resolve("done!"), 5000);


        }
else{
    reject("printin Rejection");
}
})

let createTestData = function(username, password){
    return new Promise(function(resolve, reject){
        if(username == password){
            resolve("Resolving createTestData");
        }
        else{
            resolve("Rejecttttttt");
        }
    })

}
    




samplePromise.then(function(text){
    console.log(text); 
})


