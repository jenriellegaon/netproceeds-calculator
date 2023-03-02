/* eslint-disable no-mixed-operators */
import { TextField } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment'
import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import './App.scss'
import { getDifferenceInDays, roundOff } from './helpers'

function App() {
  const [discountingDate, setdiscountingDate] = useState(moment().startOf('day'))
  const [dueDate, setdueDate] = useState(moment().startOf('day'))
  const [values, setValues] = useState({
    outstandingAmount: 0,
    vatRate: 0,
    factorRate: 0,
    atc: 0,
    processingFee: 0,
    bankCharge: 0,
    fixedAmount: 0,
  })
  const [chargeTo, setchargeTo] = useState("BUYER")

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSelectChargeTo = (event) => {
    setchargeTo(event?.target?.value)
  }

  const vatRate = values?.vatRate / 100
  const factorRate = values?.factorRate / 100
  const atc = values?.atc / 100
  const processingFee = values?.processingFee / 100
  const bankCharge = values?.bankCharge / 100

  const daysBeforeDueDate = getDifferenceInDays(dueDate, discountingDate)
  const divisor = daysBeforeDueDate < 365 ? 360 : 365

  const taxWithheld = roundOff(values?.outstandingAmount / (vatRate + 1) * atc)
  const acceptedAmount = roundOff(values?.outstandingAmount - taxWithheld)

  let bankChargeValue = 0
  let processingFeeValue = 0
  let totalCharges = 0
  if (!isEmpty(values?.processingFee)) {
    bankChargeValue = roundOff(acceptedAmount * bankCharge)
    processingFeeValue = roundOff(acceptedAmount * processingFee)
    totalCharges = roundOff(bankChargeValue + processingFeeValue)
  } else if (!isEmpty(values?.fixedAmount)) {
    bankChargeValue = roundOff(acceptedAmount * bankCharge)
    totalCharges = roundOff(bankChargeValue + Number(values?.fixedAmount))
  }

  const factorAmount = roundOff(acceptedAmount * (factorRate * daysBeforeDueDate) / divisor)
  const receivableAmount = chargeTo === "BUYER" ? roundOff(acceptedAmount + totalCharges) : acceptedAmount
  const netProceeds = chargeTo === "BUYER" ? roundOff(acceptedAmount - factorAmount) : roundOff(acceptedAmount - factorAmount - totalCharges)
  const accrualAmount = chargeTo === "BUYER" ? roundOff(factorAmount + totalCharges) : factorAmount
  const creditSellerCasa = netProceeds
  const creditEarned = chargeTo === "BUYER" ? 0 : totalCharges
  const creditUnearned = accrualAmount
  // const creditTotal = roundOff(creditSellerCasa + creditEarned + creditUnearned)
  const creditDebitB2B = chargeTo === "BUYER" ? receivableAmount : acceptedAmount
  const creditEarnedAccrual = roundOff(factorAmount / daysBeforeDueDate) || 0
  const creditUnearnedAccrual = roundOff(factorAmount / daysBeforeDueDate) || 0

  return (
    <div className="app-main">
      <span className="header">Net Proceeds Calculator</span>
      <div className="container">
        <div className="dates">
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              label="Discounting Date"
              value={discountingDate}
              onChange={(newValue) => {
                setdiscountingDate(newValue)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newValue) => {
                setdueDate(newValue)
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
        <div className="forms">
          <TextField
            id="outstandingAmount"
            label="Outstanding Amount"
            variant="outlined"
            placeholder="0"
            fullWidth
            type="number"
            onChange={handleChange('outstandingAmount')}
          />
          <TextField
            id="vatRate"
            label={`Vat Rate (${values?.vatRate / 100})`}
            variant="outlined"
            placeholder="0%"
            fullWidth
            type="number"
            onChange={handleChange('vatRate')}
          />
          <TextField
            id="factorRate"
            label={`Factor Rate (${values?.factorRate / 100})`}
            variant="outlined"
            placeholder="0%"
            fullWidth
            type="number"
            onChange={handleChange('factorRate')}
          />
          <TextField
            id="atc"
            label={`ATC (${values?.atc / 100})`}
            variant="outlined"
            placeholder="0%"
            fullWidth
            type="number"
            onChange={handleChange('atc')}
          />
          <TextField
            id="processingFee"
            label={`Processing Fee (${values?.processingFee / 100})`}
            variant="outlined"
            placeholder="0%"
            fullWidth
            type="number"
            onChange={handleChange('processingFee')}
            disabled={!isEmpty(values?.fixedAmount)}
          />
          <TextField
            id="fixedAmount"
            label="Fixed Amount"
            variant="outlined"
            placeholder="0"
            fullWidth
            type="number"
            onChange={handleChange('fixedAmount')}
            disabled={!isEmpty(values?.processingFee)}
          />
          <TextField
            id="bankCharge"
            label={`Bank Charges (${values?.bankCharge / 100})`}
            variant="outlined"
            placeholder="0%"
            fullWidth
            type="number"
            onChange={handleChange('bankCharge')}
          />
          <FormControl fullWidth>
            <InputLabel id="chargeToLabel">Charge To</InputLabel>
            <Select
              labelId="chargeToLabel"
              id="chargeTo"
              value={chargeTo}
              label="Charge To"
              onChange={handleSelectChargeTo}
            >
              <MenuItem value="BUYER">Buyer</MenuItem>
              <MenuItem value="SELLER">Seller</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className="results-container">
          <div className="left-container">
            <div className="results">
              <span>Days Before Due Date</span>
              <span>{daysBeforeDueDate}</span>
            </div>
            <div className="results">
              <span>Divisor</span>
              <span>{divisor}</span>
            </div>
            <div className="results">
              <span>Tax Withheld</span>
              <span>{taxWithheld}</span>
            </div>
            <div className="results">
              <span>Accepted Amount</span>
              <span>{acceptedAmount}</span>
            </div>
            <div className="results">
              <span>Factor Amount</span>
              <span>{factorAmount}</span>
            </div>
            <div className="results">
              <span>Total Charges</span>
              <span>{totalCharges}</span>
            </div>
            <div className="results">
              <span>Receivable Amount</span>
              <span>{receivableAmount}</span>
            </div>
            <div className="results">
              <span>Net Proceeds</span>
              <span>{netProceeds}</span>
            </div>
            <div className="results">
              <span>Accrual Amount</span>
              <span>{accrualAmount}</span>
            </div>
          </div>
          <div className="right-container">
            <div className="results">
              <span>Debit AR/GL</span>
              <span>{receivableAmount}</span>
            </div>
            <div className="results">
              <span>Credit Seller CASA</span>
              <span>{creditSellerCasa}</span>
            </div>
            <div className="results">
              <span>Credit Earned (Bank to Seller)</span>
              <span>{creditEarned}</span>
            </div>
            <div className="results">
              <span>Credit Unearned (Bank to Seller)</span>
              <span>{creditUnearned}</span>
            </div>
            {/* <div className="results">
              <span>Credit Total</span>
              <span>{creditTotal}</span>
            </div> */}
            <div className="results">
              <span>Credit AR</span>
              <span>{creditDebitB2B}</span>
            </div>
            <div className="results">
              <span>Debit Buyer CASA</span>
              <span>{creditDebitB2B}</span>
            </div>
            <div className="results">
              <span>Total Accrual Amount</span>
              <span>{factorAmount}</span>
            </div>
            <div className="results">
              <span>Credit Earned (Daily Accrual)</span>
              <span>{creditEarnedAccrual}</span>
            </div>
            <div className="results">
              <span>Credit Unearned (Daily Accrual)</span>
              <span>{creditUnearnedAccrual}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
