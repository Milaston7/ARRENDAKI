
import { GoogleGenAI } from "@google/genai";
import { Property, User } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContract = async (property: Property, user: User, formData: any): Promise<string> => {
  const isLease = property.listingType === 'Arrendar';
  const clauseCount = isLease ? 15 : 20;
  const transactionType = isLease ? 'CONTRATO DE ARRENDAMENTO URBANO' : 'CONTRATO DE PROMESSA DE COMPRA E VENDA';
  
  const prompt = `
    Atue como um advogado especialista em Direito Imobiliário Angolano.
    Redija um ${transactionType} formal e legalmente válido em Angola.
    
    **DADOS DAS PARTES:**
    - Primeiro Outorgante (Senhorio/Vendedor): ID ${property.ownerId}, Proprietário legítimo.
    - Segundo Outorgante (Inquilino/Comprador): ${user.name}, BI/NIF: ${formData.nif}, Residente em: ${formData.address}.
    
    **DADOS DO IMÓVEL:**
    - Tipo: ${property.type}
    - Localização: ${property.location.address}, ${property.location.municipality}, ${property.location.province}.
    - Descrição: ${property.title}.
    
    **CONDIÇÕES DO NEGÓCIO:**
    - Valor: ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: property.currency }).format(property.price)} ${isLease ? '/mês' : '(Valor Total)'}.
    - Duração (se arrendamento): ${formData.duration} meses, início em ${formData.startDate}.
    
    **REQUISITOS ESTRUTURAIS OBRIGATÓRIOS:**
    1. O contrato DEVE ter EXATAMENTE ${clauseCount} cláusulas numeradas (Cláusula 1ª a Cláusula ${clauseCount}ª).
    2. A linguagem deve ser jurídica, formal e em Português de Portugal (norma Angolana).
    3. Inclua local para assinatura digital no final.
    4. Não inclua texto introdutório fora do contrato, apenas o conteúdo do documento.
    5. Se for Venda, inclua cláusulas sobre sinal, escritura pública e prazos de pagamento.
    6. Se for Arrendamento, inclua cláusulas sobre caução, benfeitorias e resolução do contrato.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Erro ao gerar contrato. Por favor, tente novamente.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    return "Não foi possível gerar o contrato automaticamente neste momento. Por favor, contacte o suporte.";
  }
};
