export const blues = ['#5D9AF2', '#6BD0E8', '#3079E3', '#1E3A8A', '#3B82F6', '#60A5FA']
export const oranges = ['#FFDDC0', '#F8DA71', '#EA974F', '#FE9A07', '#FFEED4']
export const mixed = [
  '#FFD08B',
  '#9DBDFF',
  '#F8FFC1',
  '#D9F5F3',
  '#EA974F',
  '#C4D2EE',
  '#FFEED4',
  '#FFF6B1',
]

export const generateBlues = (index: number) => blues[index % blues.length]
export const generateOranges = (index: number) => oranges[index % oranges.length]
export const generateMixed = (index: number) => mixed[index % mixed.length]
