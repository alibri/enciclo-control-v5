import MarkdownIt from "markdown-it";

export const formatCurrency = (value: number) => {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
};

export const formatDateTime = (datetime: number) => {
  if (!datetime) {
    return '';
  }
  const date = new Date(datetime * 1000);
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).format(date);
};

export const formatPageType = (type: string) => {
  const types: Record<string, string> = {
    page: 'info',
    importado: 'warning',
    preview: 'success'
  };

  return types[type] ?? 'danger';
};

export const formatStatus = (type: string) => {
  console.log('formatStatus', type);
  const types: Record<string, string> = {
    importado: 'danger',
    inactive: 'warning',
    recibido: 'info',
    active: 'success'
  };

  return types[type] ?? 'secondary';
};

export const getStatus = () => {
  return [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
    { label: 'Importado', value: 'importado' },
    { label: 'Recibido', value: 'recibido' }
  ];
};

export const formatLoginMode = (type: string) => {
  const types: Record<string, string> = {
    username: 'info',
    token: 'warning'
    // preview: 'success'
  };

  return types[type] ?? 'danger';
};

export const formatIntNumber = (value: number) => {
  return value?.toLocaleString('de-DE', { minimumFractionDigits: 0 });
};

export const formatSegundosAHora = (segundos: number): string => {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;

  const formatoHora = (valor: number): string => {
    return valor < 10 ? '0' + valor.toString() : valor.toString();
  };

  return `${formatoHora(horas)}:${formatoHora(minutos)}:${formatoHora(segundosRestantes)}`;
};

export const convertDateFormat = (inputDate: string) => {
  // if empty return empty
  if (!inputDate) {
    return '';
  }
  const datePart = inputDate.match(/\d+/g);
  if (!datePart) {
    return '';
  }
  const year = datePart[0].substring(2); // get only two digits
  const month = datePart[1]; const day = datePart[2];

  return day + '-' + month + '-20' + year;
};

const markdown = new MarkdownIt();

export const formatStringPre = (value: string) => {
  return markdown.render(value);
};

export const formatFloat = (value: number, digits: number = 6) => {
  return value?.toFixed(digits);
};

export const formatLike = (value: number) => {
  if (value === 0) {
    return '<i class="pi pi-thumbs-down-fill text-red-500"></i>';
  } else if (value === 1) {
    return '<i class="pi pi-thumbs-up-fill text-green-500"></i>';
  } else {
    return '<i class="pi pi-equals text-300">=</i>';
  }
};

export const formatRespuestaSiNo = (value: boolean) => {
  if (value === false) {
    return '<i class="pi pi-exclamation-triangle text-red-500"></i>';
  } else {
    return '<i class="pi pi-check-circle text-green-500"></i>';
  }
};

export const formatSabias = (value: string) => {
  if (value?.toString().length > 0) {
    return '<i class="pi pi-bell text-yellow-500"></i>';
  }
};

export const formatStatusRepository = (type: string) => {
  const types: Record<string, string> = {
    deleted: 'danger',
    error: 'warning',
    uploaded: 'info',
    importing: 'warning',
    imported: 'success',
  };

  return types[type] ?? 'secondary';
};

export const formatSize = (bytes: number) => {
    const k = 1024;
    const dm = 3;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};

export const formatFileIcon = (type: string) => {
  const types: Record<string, string> = {
    pdf: 'pi pi-file-pdf',
    doc: 'pi pi-file-word',
    docx: 'pi pi-file-word',
    txt: 'pi pi-file-text'
  };
  return types[type] ?? 'pi pi-file';
};