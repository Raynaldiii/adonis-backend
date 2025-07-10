export function toRoman(month: number): string {
    if (month < 1 || month > 12) {
      throw new Error('Bulan tidak valid. Harus antara 1 dan 12.');
    }
    const romawi = [
      '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
    ];
    return romawi[month];
  }
