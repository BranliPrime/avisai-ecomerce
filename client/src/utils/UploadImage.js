import Axios from '../utils/Axios'
import SummaryAPi from '../common/SummaryApi'

const uploadImage = async(image)=>{
  try {
    const formData = new  FormData()
    formData.append('image',image)

    const response = await Axios({
      ...SummaryAPi.uploadImage,
      data : formData
    })

    return response 

  } catch (error) {
    return error
  }
}

export default uploadImage