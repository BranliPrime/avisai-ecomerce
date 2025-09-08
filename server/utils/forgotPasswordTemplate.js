const forgotPasswordTemplate = ({ name, otp }) => {
  return `
<div>
  <p>Estimado/a ${name},</p>
  <p>Has solicitado restablecer tu contraseña. Por favor, utiliza el siguiente código OTP para restablecer tu contraseña:</p>
  <div style="background:yellow; font-size:20px;padding:20px;text-align:center;font-weight:800;">
      ${otp}
  </div>
  <p>Este código es válido solo por 1 hora. Ingresa este código en el sitio web de MULTISERVICIOS AVISAI para continuar con el restablecimiento de tu contraseña.</p>
  <br/>
  <p>Gracias,</p>
  <p>MULTISERVICIOS AVISAI</p>
</div>
  `;
};

export default forgotPasswordTemplate;
