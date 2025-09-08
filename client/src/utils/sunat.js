export const consultarSunat = async (documento, tipo) => {
  try {
    const response = await fetch('http://localhost:3002/api/sunat/consulta-sunat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento, tipo })
    });

    if (!response.ok) {
      // Si el status es diferente de 200, mostramos el error
      const errorData = await response.json();
      throw new Error(errorData.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en la consulta:', error.message);
    return null;
  }
};
