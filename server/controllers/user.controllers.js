import sendEmail from "../config/sendEmail.js"
import UserModel from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js"
import generatedAccessToken from "../utils/generatedAccessToken.js"
import generatedRefreshToken from "../utils/generatedRefreshToken.js"
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from "../utils/generatedOtp.js"
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js"
import jwt from "jsonwebtoken"

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Proporcione correo electrónico, nombre y contraseña",
        error: true,
        success: false
      })
    }

    const user = await UserModel.findOne({ email })

    if (user) {
      return res.json({
        message: "El correo electrónico ya está registrado",
        error: true,
        success: false
      })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashPassword = await bcryptjs.hash(password, salt)

    const payload = {
      name,
      email,
      password: hashPassword
    }

    const newUser = new UserModel(payload)
    const save = await newUser.save()

    const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

    const verifyEmail = await sendEmail({
      sendTo: email,
      subject: "Verificar correo electrónico de MULTISERVICIOS AVISAI",
      html: verifyEmailTemplate({
        name,
        url: VerifyEmailUrl
      })
    })

    return res.json({
      message: "Usuario registrado exitosamente",
      error: false,
      success: true,
      data: save
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

export async function verifyEmailController(req, res) {
  try {
    const { code } = req.body

    const user = await UserModel.findOne({ _id: code })

    if (!user) {
      return res.status(400).json({
        message: "Código inválido",
        error: true,
        success: false
      })
    }

    const updateUser = await UserModel.updateOne({ _id: code }, {
      verify_email: true
    })

    return res.json({
      message: "Correo electrónico verificado correctamente",
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: true
    })
  }
}

//login controller
export async function loginController(req, res) {
  try {
    const { email, password } = req.body


    if (!email || !password) {
      return res.status(400).json({
        message: "Proporcione email y contraseña",
        error: true,
        success: false
      })
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "El usuario no está registrado",
        error: true,
        success: false
      })
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Contacte al administrador",
        error: true,
        success: false
      })
    }

    const checkPassword = await bcryptjs.compare(password, user.password)

    if (!checkPassword) {
      return res.status(400).json({
        message: "Verifique su contraseña",
        error: true,
        success: false
      })
    }

    const accesstoken = await generatedAccessToken(user._id)
    const refreshToken = await generatedRefreshToken(user._id)

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      last_login_date: new Date()
    })

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }
    res.cookie("accessToken", accesstoken, cookiesOption)
    res.cookie("refreshToken", refreshToken, cookiesOption)

    return res.json({
      message: "Inicio de sesión exitoso",
      error: false,
      success: true,
      data: {
        accesstoken,
        refreshToken
      }
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//logout controller 

export async function logoutController(req, res) {
  try {
    const userid = req.userId //middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }

    res.clearCookie("accessToken", cookiesOption)
    res.clearCookie("refreshToken", cookiesOption)

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: ""
    })

    return res.json({
      message: "Cierre de sesión exitoso",
      error: false,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//subir avatar de usuario

export async function uploadAvatar(req, res) {
  try {
    const userId = req.userId // auth middlware
    const image = req.file  // multer middleware

    const upload = await uploadImageClodinary(image)
    console.log("image", image)

    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url
    })

    return res.json({
      message: "Avatar subido correctamente",
      success: true,
      error: false,
      data: {
        _id: userId,
        avatar: upload.url
      }
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//actualizar detalles de usuarios

export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId //auth middleware
    const { name, email, mobile, password } = req.body

    let hashPassword = ""

    if (password) {
      const salt = await bcryptjs.genSalt(10)
      hashPassword = await bcryptjs.hash(password, salt)
    }

    const updateUser = await UserModel.updateOne({ _id: userId }, {
      ...(name && { name: name }),
      ...(email && { email: email }),
      ...(mobile && { mobile: mobile }),
      ...(password && { password: hashPassword })
    })

    return res.json({
      message: "Actualizado exitosamente",
      error: false,
      success: true,
      data: updateUser
    })


  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//olvidó la contraseña de inició sesión

export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "Este correo no está registrado. Por favor verifica e intenta de nuevo.",
        error: true,
        success: false
      })
    }

    const otp = generatedOtp()
    const expireTime = new Date() + 60 * 60 * 1000 // 1hr

    const update = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(expireTime).toISOString()
    })

    await sendEmail({
      sendTo: email,
      subject: "Olvidó la contraseña de MULTISERVICIOS AVISAI",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp
      })
    })

    return res.json({
      message: "Revisa tu correo electrónico",
      error: false,
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//verificar contraseña olvidada otp

export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        message: "Proporciona los campos requeridos: correo electrónico, otp.",
        error: true,
        success: false
      })
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "Correo electrónico no disponible",
        error: true,
        success: false
      })
    }

    const currentTime = new Date().toISOString()

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "El código ha expirado",
        error: true,
        success: false
      })
    }

    if (otp !== user.forgot_password_otp) {
      return res.status(400).json({
        message: "Código inválido",
        error: true,
        success: false
      })
    }

    //if otp is not expired
    //otp === user.forgot_password_otp

    const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
      forgot_password_otp: "",
      forgot_password_expiry: ""
    })

    return res.json({
      message: "Código verificado exitosamente",
      error: false,
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//restablecer la contraseña

export async function resetpassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Proporciona los campos requeridos: correo electrónico, nueva contraseña, confirmar contraseña"
      })
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "Correo electrónico no disponible",
        error: true,
        success: false
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Ambas contraseñas deben ser iguales.",
        error: true,
        success: false,
      })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashPassword = await bcryptjs.hash(newPassword, salt)

    const update = await UserModel.findOneAndUpdate(user._id, {
      password: hashPassword
    })

    return res.json({
      message: "Contraseña actualizada exitosamente.",
      error: false,
      success: true
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}


//refreshh token 

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

    if (!refreshToken) {
      return res.status(401).json({
        message: "Token inválido",
        error: true,
        success: false
      })
    }
    console.log("refreshToken", refreshToken)
    const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

    if (!verifyToken) {
      return res.status(401).json({
        message: "El token ha expirado",
        error: true,
        success: false
      })
    }
    console.log("verifyToken", verifyToken)
    const userId = verifyToken?._id

    const newAccessToken = await generatedAccessToken(userId)

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    }

    res.cookie('accessToken', newAccessToken, cookiesOption)

    return res.json({
      message: "Nuevo token de acceso generado",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken
      }
    })


  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//Obtener detalles del usuario que ha iniciado sesión
export async function userDetails(req, res) {
  try {
    const userId = req.userId

    console.log(userId)

    const user = await UserModel.findById(userId).select('-password -refresh_token')

    return res.json({
      message: 'Detalles del usuario',
      data: user,
      error: false,
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      message: "Algo salió mal",
      error: true,
      success: false
    })
  }
}

