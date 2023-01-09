const fs = require('fs');
const path = require('path');

// const target = path.join(__dirname, './ocr_data2.json');
// const target = path.join(__dirname, './ocr_data_join_2.json');
const target = path.join(__dirname, './ocr_data4.json');

// const target = path.join(__dirname, './ocr_data5.json');

// スプリングベース
// const target = path.join(__dirname, './ocr_data_join_1.json');
// const target = path.join(__dirname, './ocr_data3.json');

// const targetWord = '品名'
// const targetWord = '名称'
// const targetWord = 'TITLE'

// No. detect
// const targetWord = 'F2S-13188'
// const targetWord = 'DWG.NO.'

// const targetWord = 'ASD14-710-231-1'

const targetWords = [
  // 'F2S-13188',
  // 'ASD14-710-231-1',
  'TITLE',
  '品名',
  '名称',
]

function main(){
  const ocrDataStr = fs.readFileSync(target, 'utf8')
  const ocrData = JSON.parse(ocrDataStr)
  let baseBlock = null
  for (let index = 0; index < targetWords.length; index++) {
    baseBlock = ocrData.find((block) => block.word.includes(targetWords[index]))
    if (baseBlock) {
      break 
    }
  }
  if (!baseBlock) {
    console.log("keywords is null");
    return  
  }
  // const baseBlock = ocrData.find((block) => block.word == targetWord)
  console.log("🚀 ~ file: index.js:15 ~ main ~ baseBlock", JSON.stringify(baseBlock))
  let sumX = 0
  let sumY = 0
  for (let index = 0; index < baseBlock.boundingPoly.vertices.length; index++) {
    const element = baseBlock.boundingPoly.vertices[index];
    sumX += element[0].x
    sumY += element[0].y
  }
  let avaX = sumX / baseBlock.boundingPoly.vertices.length 
  let avaY = sumY / baseBlock.boundingPoly.vertices.length 
  let resultData = ocrData.reduce((acc, cur)=>{
    const word = cur.word
    const potision = []
    for (let index = 0; index < cur.boundingPoly.vertices.length; index++) {
      const element = cur.boundingPoly.vertices[index];
      const x = element[0].x - avaX
      const y = element[0].y - avaY
      potision.push({x,y})
    }
    acc.push({
      word,
      potision
    })
    return acc
  },[])

  const eve = resultData.reduce((acc, result) => {
    const mostNear = result.potision.reduce((pAcc, position)=>{
      	return evaluate(position.x,position.y, pAcc.x,pAcc.y)
      },{x:9999,y:9999})
    acc.push({
     	word:result.word,
     	position:mostNear
    })
    return acc
  	},[])
  const resultArray = eve.sort((a,b)=>{
    return sortEveluate(a.position.x,a.position.y,b.position.x,b.position.y)
  })
  console.log("🚀 ~ file: index.js:45 ~ main ~ resultArray", resultArray)
  // console.log("", resultArray[0],resultArray[1],resultArray[2],resultArray[3])
  // console.log("🚀 ~ file: index.js:50 ~ main ~ resultArray[0]", resultArray[0])
  console.log("🚀 ~ file: index.js:50 ~ main ~ resultArray[1]", resultArray[1])
  console.log("🚀 ~ file: index.js:50 ~ main ~ resultArray[2]", resultArray[2])
  console.log("🚀 ~ file: index.js:50 ~ main ~ resultArray[3]", resultArray[3])
  console.log("🚀 ~ file: index.js:92 ~ main ~ baseBlock.word", baseBlock.word)
}

function sortEveluate(aX,aY,bX,bY) {
  const aXabs = Math.abs(aX)
  const bXabs = Math.abs(bX)
  const aYabs = Math.abs(aY)
  const bYabs = Math.abs(bY)
  const axy = aXabs + aYabs
  const bxy = bXabs + bYabs
  return axy - bxy
}

function evaluate(aX,aY,bX,bY) {
  const aXabs = Math.abs(aX)
  const bXabs = Math.abs(bX)
  const aYabs = Math.abs(aY)
  const bYabs = Math.abs(bY)
  const axy = aXabs + aYabs
  const bxy = bXabs + bYabs
  if(axy < bxy){
    return {
      x:aX,
      y:aY
    }
  }else{
    return {
      x:bX,
      y:bY
    }
  }

}

main()