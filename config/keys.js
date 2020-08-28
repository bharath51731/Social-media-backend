// module.exports = {
//     URI:'mongodb+srv://test:m9bKQAGp83Db54P@cluster0.hcfem.mongodb.net/App?retryWrites=true&w=majority',    
//     JWT_SECRET:'vrfrfgvchbrejcbjbduj&&Y&R%ERIOBJJ{}P|}{IKOUFTDGJHOK'
// }

// module.exports = {
//     URI:"mongodb://localhost:27017/social-media",
//     JWT_SECRET:'vrfrfgvchbrejcbjbduj&&Y&R%ERIOBJJ{}P|}{IKOUFTDGJHOK'
// }


module.exports = {
    URI:process.env.URI,
    JWT_SECRET:process.env.JWT_SECRET,
    password : process.env.PASSWORD
}