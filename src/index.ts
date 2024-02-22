import express, { Express, Request, Response } from 'express'

const app: Express = express()

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello from TS NODE')
})

app.get('/:id', (req: Request, res: Response) => {
  res.status(200).send('Hello from TS NODE EXTRA')
})

app.listen(7000, () => {
  console.log(`Server listening on port : ${7000}`)
})
