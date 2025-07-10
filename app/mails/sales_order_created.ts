import { BaseMail } from '@adonisjs/mail'
import SalesOrder from '#models/sales_order'
import User from '#models/auth/user'
import Perusahaan from '#models/perusahaan'
import Cabang from '#models/cabang'
import Customer from '#models/customer'

export default class SalesOrderCreated extends BaseMail {
  from = 'sales@yourcompany.com'
  subject = 'Sales Order Confirmation'

  constructor(
    private so: SalesOrder,
    private customer: Customer,
    private perusahaan: Perusahaan,
    private cabang: Cabang
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the mail is sent or queued.
   */
  prepare() {
    const htmlContent = `
      <h1>Konfirmasi Pesanan Penjualan</h1>
      <p>Halo ${this.customer.name},</p>
      <p>Terima kasih atas pesanan Anda. Berikut adalah detail pesanan Anda:</p>
      <ul>
        <li><strong>No. SO:</strong> ${this.so.noSo}</li>
        <li><strong>Tanggal:</strong> ${this.so.date instanceof Date ? this.so.date.toISOString().slice(0, 10) : this.so.date}</li>
        <li><strong>Perusahaan:</strong> ${this.perusahaan && 'name' in this.perusahaan ? this.perusahaan.name : ''}</li>
        <li><strong>Cabang:</strong> ${this.cabang && 'name' in this.cabang ? this.cabang.name : ''}</li>
        <li><strong>Total:</strong> ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(this.so.total)}</li>
      </ul>
      <p>Kami akan segera memproses pesanan Anda.</p>
      <p>Hormat kami,<br>Tim Penjualan</p>
    `

    this.message.to(this.customer.email).html(htmlContent)
  }
}
