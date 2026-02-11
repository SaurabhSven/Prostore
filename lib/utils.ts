import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert prisma object into a regular JS Object
export function convertToPlainObject<T>(value:T):T{
  return JSON.parse(JSON.stringify(value));
}

// Format Number with decimal places
export function formatNumberWithDecimal(value:number):string{
  const [int, decimal] = value.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2,"0")}` : `${int}.00`;
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}

// Round number to 2 decimal places
export function round2(value:number | string):number{
  if(typeof value === 'number'){
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }else if(typeof value === 'string'){
    return round2(parseFloat(value));
  }else{
    throw new Error("Invalid value type");
  }
}


// Currency Formatter

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US',{
  currency:'USD',
  style:'currency',
  minimumFractionDigits:2
})


// Format currency using the formatter above
export function formatCurrency(amount:number | string | null){
  if(typeof amount === 'number'){
    return CURRENCY_FORMATTER.format(amount);
  }else if(typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount))
  }else{
    return 'NaN'
  }
}