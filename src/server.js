import Express from "Express" //added "type" : "module" to the JSON file
import { join } from "path"
import cors from 'cors'
import { genericErrorHandler, badRequestHandler, unauthorizedHandler, notfoundHandler } from "./errorHandlers.js"
import listEndpoints from "express-list-endpoints"
import productsRouter from "./api/products/products.js"
import reviewsRouter from "./api/reviews/reviews.js"

const server = Express()
const port = 3001
const publicFolderPath = join(process.cwd(), "./public")

//GLOBAL MIDDLEWARES
server.use(Express.static(publicFolderPath))
server.use(cors())
server.use(Express.json())

//ENDPOINTS
server.use("/products", productsRouter)
server.use("/products", reviewsRouter)

//ERROR HANDLERS
server.use(badRequestHandler) //400
server.use(unauthorizedHandler) //401
server.use(notfoundHandler) //404
server.use(genericErrorHandler) //500

//ESSENTIALS
server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server is running on port ${port}`)
})