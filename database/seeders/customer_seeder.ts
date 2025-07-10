import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Customer from '#models/customer'

export default class CustomerSeeder extends BaseSeeder {
  public async run() {
    await Customer.createMany([
      {
        name: 'PT Sukses Makmur',
        email: 'info@suksesmakmur.co.id',
        phone: '021-12345678',
        address: 'Jl. Merdeka No. 123, Jakarta',
        npwp: '01.234.567.8-999.000',
        logo: 'suksesmakmur.png',
      },
      {
        name: 'CV Maju Jaya',
        email: 'contact@majubersama.com',
        phone: '022-87654321',
        address: 'Jl. Sudirman No. 45, Bandung',
        npwp: '02.345.678.9-888.000',
        logo: 'majubersama.png',
      },
      {
        name: 'PT Sentosa Abadi',
        email: 'admin@sentosaabadi.co.id',
        phone: '031-11223344',
        address: 'Jl. Diponegoro No. 67, Surabaya',
        npwp: '03.456.789.0-777.000',
        logo: 'sentosaabadi.png',
      },
      {
        name: 'UD Berkah Sejahtera',
        email: 'berkah@sejahtera.com',
        phone: '024-33445566',
        address: 'Jl. Gajahmada No. 89, Semarang',
        npwp: '04.567.890.1-666.000',
        logo: 'berkahsejahtera.png',
      },
      {
        name: 'PT Amanah Mulia',
        email: 'cs@amanahmulia.co.id',
        phone: '0251-55667788',
        address: 'Jl. Pajajaran No. 101, Bogor',
        npwp: '05.678.901.2-555.000',
        logo: 'amanahmulia.png',
      },
    ])
  }
}