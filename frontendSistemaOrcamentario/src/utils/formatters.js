export const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateForInput = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

export const formatCPF_CNPJ = (value) => {
  const cleanedValue = value.replace(/\D/g, '');

  if (cleanedValue.length <= 11) {
    // CPF
    return cleanedValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ
    return cleanedValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

export const formatTelefone = (value) => {
  const cleanedValue = value.replace(/\D/g, '');

  if (cleanedValue.length <= 10) {
    // Telefone Fixo ou Celular sem 9
    return cleanedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular com 9
    return cleanedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};
