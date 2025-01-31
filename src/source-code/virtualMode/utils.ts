export const isNumber = (v: any) => typeof v === 'number'
export const isString = (v: any) => typeof v === 'string'
export const isBoolean = (v: any) => typeof v === 'boolean'
export const isNull = (v: any) => v === null

export const isArray = (v: any) => Object.prototype.toString.call(v) === '[object Array]'

export const isObject = (v: any) => Object.prototype.toString.call(v) === '[object Object]'

export const isComplex = (v: any) => typeof v === 'object' && !isNull(v)
export const isPrimary = (v: any) => !isComplex(v)

export function clapTabularFromJson(value: object, deep: number = 1) {
  const ans: IRenderItem[] = []
  ans.push({
    type: 'leftBracket',
    key: null,
    renderValue: isArray(value) ? '[' : '{',
    length: Object.keys(value).length,
    dataType: isArray(value) ? 'Array' : 'Object',
    deep: 0,
    open: true,
    rightBracket: isArray(value) ? ']' : '}',
    mainValue: value
  })

  getAllRow(value, deep)

  ans.push({
    type: 'rightBracket',
    key: null,
    renderValue: isArray(value) ? ']' : '}',
    rightBracket: isArray(value) ? ']' : '}',
    deep: 0
  })

  return ans.map((x, index) => ({ index, ...x }))

  function getAllRow(value: any, deep: number): void {
    const keys = Object.keys(value)
    keys.forEach((key, idx) => {
      let mainValue = value[key]

      // 如果是原始类型
      if (isPrimary(mainValue)) {
        ans.push({
          type: 'key-value',
          key,
          renderValue: typeof mainValue === 'string' ? `'${mainValue}'` : String(mainValue),
          deep,
          isComma: idx !== keys.length - 1,
          className: mainValue === null ? 'null' : typeof mainValue,
          parentDataType: isArray(value) ? 'Array' : 'Object',
          mainValue
        })
      } else {
        handleObject()
      }

      function handleObject() {
        if (Object.keys(mainValue).length === 0) {
          ans.push({
            type: 'empty-array-or-object',
            key,
            renderValue: isArray(mainValue) ? '[' : '{',
            rightBracket: isArray(mainValue) ? ']' : '}',
            deep,
            open: true,
            isLastOne: idx == keys.length - 1,
            length: Object.keys(mainValue).length,
            dataType: isArray(mainValue) ? 'Array' : 'Object',
            parentDataType: isArray(value) ? 'Array' : 'Object',
            mainValue,
            isComma: idx !== keys.length - 1
          })
        } else {
          ans.push({
            type: 'key-leftBracket',
            key,
            renderValue: isArray(mainValue) ? '[' : '{',
            rightBracket: isArray(mainValue) ? ']' : '}',
            deep,
            open: true,
            isLastOne: idx == keys.length - 1,
            length: Object.keys(mainValue).length,
            dataType: isArray(mainValue) ? 'Array' : 'Object',
            parentDataType: isArray(value) ? 'Array' : 'Object',
            mainValue
          })

          getAllRow(mainValue, deep + 1)

          ans.push({
            type: 'rightBracket',
            key: null,
            renderValue: isArray(mainValue) ? ']' : '}',
            deep,
            isComma: idx !== keys.length - 1
          })
        }
      }
    })
  }
}

export const getAllBracket = (array: IRenderItem[]) => {
  const ak = array.filter(item => ['leftBracket', 'key-leftBracket', 'rightBracket'].includes(item.type))

  const bracketArray: IBracketItem[] = []
  const stack: number[] = []

  ak.forEach(item => {
    if (['[', '{'].includes(item.renderValue)) stack.push(item.index)
    else bracketArray.push({ startIdx: stack.pop(), endIdx: item.index, open: true })
  })

  return bracketArray
}

export const throttleRaf = func => {
  let rafId = null

  return () => {
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        func()
        rafId = null
      })
    }
  }
}

export const isLeftBracketItem = (item: IRenderItem) => {
  return item.type === 'leftBracket' || item.type === 'key-leftBracket'
}

export const isRightBracketItem = (item: IRenderItem) => {
  return item.type === 'rightBracket'
}
