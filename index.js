const fetch = require('node-fetch')
const accessToken = process.env.GYAZO_ACCESS_TOKEN

// class Gyazo {
//   constructor(accessToken) {
//     accessToken = accessToken
//   }
//   load() {
//     return fetch(`https://api.gyazo.com/api/images/?images/?page=${page}&per_page=${perPage}`, 
//       { 
//         method: 'GET', 
//         headers: {'Authorization':  `Bearer ${accessToken}`}
//       }
//     )
//   }
// }

const getTotalCount = async () => {
  const response = await fetch(`https://api.gyazo.com/api/images/?page=1&per_page=1`, 
    { 
      method: 'GET', 
      headers: {'Authorization':  `Bearer ${accessToken}`}
    }
  )
  return response.headers.get('x-total-count')
}

const getGyazoList = async ({totalCount}) => {
  const numLoop = Math.ceil(totalCount / 100)
  const option = {
    method: 'GET', 
    headers: {'Authorization':  `Bearer ${accessToken}`}
  }
  const promises = []

  for (let i = 0; i < numLoop; i++) {
    const numRemained = totalCount - (100 * i)
    const perPage = numRemained >= 100 ? 100 : numRemained
    promises.push(fetch(`https://api.gyazo.com/api/images/?page=${i+1}&per_page=${perPage}`, option))
  }
  const values = await Promise.all(promises)
  const responses = await Promise.all(values.map(value => value.json()))
  return responses.flat()
}

const main = async () => {
  const totalCount = await getTotalCount()
  getGyazoList({totalCount}).then(list => {
    console.log(list.length)
    console.log(list.filter(item => {
      if(!item.ocr) {return false}
      return item.ocr.description.includes('bizmobile')
    }).length)
  })
}

main()