const verifyEmailTemplate = ({ name, url }) => {
  return `
<p>Estimado/a ${name},</p>    
<p>Gracias por registrarte en MULTISERVICIOS AVISAI.</p>   
<a href=${url} style="color:black;background : orange;margin-top : 10px,padding:20px,display:block">
  Verificar correo electrónico
</a>
`
}

export default verifyEmailTemplate
