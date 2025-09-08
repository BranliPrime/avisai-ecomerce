  export const DisplayPriceInSoles = (price) =>{
    return new Intl.NumberFormat('es-PE',{
      style : 'currency',
      currency : 'PEN'
    }).format(price)
  }