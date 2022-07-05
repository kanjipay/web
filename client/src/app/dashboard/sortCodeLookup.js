// function sortCodeToBank(sortCode) {

//   switch (sortCode.slice(0, 2)) {
//     case "01": return "National Westminster Bank"
//     case "05": return "Yorkshire Bank"
//   }
// }

// 00	For IBAN use only[3]
// 01	National Westminster Bank	Formerly District Bank(1962)
// 04 - 00 - 02	BFC Bank
// 04 - 00 - 03 to 04 - 00 - 06	Monzo
// 04 - 00 - 11	Satabank
// 04 - 00 - 26	N26
// 04 - 00 - 40	Starling Bank
// 04 - 00 - 53	Payrnet / Railsbank
// 04 - 00 - 72 to 04 - 00 - 74	Modulr
// 04 - 00 - 75	Revolut
// 04 - 00 - 76	LCH Limited
// 04 - 00 - 78	Elavon Financial Services
// 04 - 00 - 79 to 04 - 00 - 80	Virgin Money Head Office
// 04 - 03 - 00 to 04 - 03 - 29	LHV Pank
// 04 - 04 - 05	ClearBank
// 04 - 04 - 76 to 04 - 04 - 77	Enumis
// 04 - 05 - 40 to 04 - 05 - 41	BCB Group
// 04 - 13 - 01	Midpoint & Transfer
// 04 - 13 - 02 to 04 - 13 - 03	Bilderlings Pay
// 04 - 13 - 04 to 04 - 13 - 05	Ecology Building Society
// 04 - 13 - 06	Allpay Limited
// 04 - 13 - 07 to 04 - 13 - 08	Clear Junction
// 04 - 13 - 12	Modulr
// 04 - 13 - 13 to 04 - 13 - 14	Project Imagine
// 04 - 13 - 15 to 04 - 13 - 16	Universal Securities & Investment
// 04 - 13 - 17 to 04 - 13 - 19	Contis Financial Services
// 04 - 13 - 42	Duesday
// 05	Clydesdale Bank	Trading as Yorkshire Bank
// 07 - 00 to 07 - 49	Nationwide Building Society
// 08	The Co - operative Bank
// 08 - 60 to 08 - 61	For building societies
// 08 - 60 - 64 for Virgin Money
// 08 - 90 to 08 - 99
// 08 - 30 to 08 - 39	Citibank	08 - 31 to 08 - 32 for UK Government banking(NS & I, HMRC etc.)
// 09 - 00 to 09 - 19	Santander UK	Formerly Abbey National(2010)
// 09 - 01 - 31 to 09 - 01 - 36 for
// 09 - 01 - 39 to 09 - 01 - 49 for Alliance & Leicester
// 09 - 01 - 51 to 09 - 01 - 56 migrated accounts

// 10 - 00 to 10 - 79	Bank of England	Previously used for government banking and BoE employee accounts[4]
// 11	Bank of Scotland	For Halifax(since 1990),
//   earlier used by Martins Bank(1962 - 1969)
// 12 - 00 to 12 - 69	For Sainsbury's Bank
// 13	Barclays Bank
// 14
// 15	The Royal Bank of Scotland	Formerly Williams & Glyn's Bank (1985),
// itself formerly Glyn, Mills & Co(1970)
// 15 - 80	For Child & Co.private bank,
//   part of The Royal Bank of Scotland(1923)
// 15 - 98 to 15 - 99	For C.Hoare & Co, independent private bank
// 16	The Royal Bank of Scotland	Formerly Williams & Glyn's Bank (1985),
// itself formerly Williams Deacon's Bank (1970)
// 16 - 00 - 38 for Drummonds Bank, part of The Royal Bank of Scotland
// 16 - 52 - 21 for the Cumberland Building Society
// 16 - 57 - 10 for Cater Allen Private Bank, part of Santander Group

// 17	Formerly Williams & Glyn's Bank (1985),
// itself formerly The National Bank(1970)
// 18	For Coutts & Co, a subsidiary of National Westminster Bank(1920)
// 19
// 20 to 29	Barclays Bank
// 20 - 11 - 47 for HMRC
// 23 - 00 - 88 for VFX Financial
// 23 - 05 - 05 for Stripe
// 23 - 05 - 80 for Metro Bank
// 23 - 14 - 70 for Wise
// 23 - 22 - 21 for Fire Financial Services
// 23 - 32 - 72 for Pockit
// 23 - 69 - 72 for Prepay Technologies
// 23 - 73 - 24 for Loot Financial Services

// 30 to 39	Lloyds Bank and TSB	Formerly Lloyds TSB(2013)
// and earlier for Lloyds Bank(1995)
// 30 - 00 - 66for Arbuthnot Latham Private Bank
// 30 - 00 - 83for Al Rayan Bank
// 30 - 02 - 48for FinecoBank UK

// 40 to 49	HSBC Bank	Formerly Midland Bank(1992)
// 49 - 99 - 79 to 49 - 99 - 99 for Deutsche Bank
// 40 - 12 - 50 to 40 - 12 - 55 for M & S Bank
// 40 - 47 - 58 to 40 - 47 - 87 for First Direct
// 40 - 51 - 78 for Jyske Bank Gibraltar
// 40 - 51 - 98 for Turkish Bank UK
// 40 - 60 - 80 for CashFlows
// 40 - 63 - 01 for the Coventry Building Society
// 40 - 63 - 77 for Cynergy Bank Limited
// 40 - 64 - 25 for Virgin Money
// 40 - 64 - 37 for Marcus

// 50 to 59	National Westminster Bank	Formerly National Provincial Bank(1968)
// 60 to 66	Formerly Westminster Bank(1968)
// 60 - 83 - 12 for Atom Bank
// 60 - 83 - 14 for Gibraltar International Bank
// 60 - 83 - 66 for Fidor Bank UK
// 60 - 83 - 71 for Starling Bank

// 60 - 84 - 07 for Chase UK(JP Morgan)

// 71	Bank of England	National Savings Bank
// 72[a]	Santander UK	Formerly Alliance & Leicester(2010),
//   itself formerly Girobank(1985)
// 77 - 00 to 77 - 44	Lloyds Bank and TSB	Formerly Lloyds TSB(2013)
// and earlier for Trustee Savings Bank(1995)
// Scotland[edit]
// Separately operated by the Committee of Scottish Clearing Bankers until 1985.

// 80 to 81	Bank of Scotland
// 82	Clydesdale Bank
// 83	The Royal Bank of Scotland	formerly National Commercial Bank of Scotland(1969),
//   formerly Commercial Bank of Scotland(1959)
// 84	formerly National Commercial Bank of Scotland(1969),
//   formerly National Bank of Scotland(1959)
// 86
// 87	TSB	formerly Lloyds TSB Scotland(2013)
// formerly TSB Scotland(1995)
// 89 - 00 to 89 - 29	Santander UK	formerly Alliance & Leicester Commercial Bank(2010)

// Range	Bank	Note
// 90	Bank of Ireland
// 91	Northern Bank	trading as Danske Bank since 2012
// formerly Belfast Bank(1970)
// 93	Allied Irish Banks(UK)	for AIB(Northern Ireland)
// formerly First Trust Bank
// formerly TSB Northern Ireland(1991)
// 94	Bank of Ireland
// 95	Northern Bank	trading as Danske Bank since 2012
// former Midland Bank subsidiary(1965)
// 98	Ulster Bank	subsidiary of National Westminster Bank(1917)

// 90	Bank of Ireland
// 92	Central Bank of Ireland
// 93	AIB Bank
// 93 - 09 - 03 for JP Morgan Bank Ireland plc
// 93 - 90 - 21 for EBS d.a.c.

// 95	Danske Bank(Ireland)	trading as Danske Bank
// 98	Ulster Bank Ireland dac
// 99
// 99 - 00 - 51 to 99 - 00 - 52 Citibank Europe plc
// 99 - 00 - 61 to 99 - 00 - 62 Bank of America
// 99 - 03 - 01 An Post
// 99 - 11 - 99 Fire Financial Services
// 99 - 99 - 01 Central Bank of Ireland for the Paymaster General of Ireland
// Irish Bank Resolution Corporation(IBRC)
// Realex Financial Services

// 99 - 02	BNP Paribas Ireland
// 99 - 02 - 04 for The Royal Bank of Scotland 99 - 02 - 12 for Barclays Bank Ireland
// 99 - 03 - 20 for Aareal Bank
// 99 - 03 - 25 for CACEIS Bank
// 99 - 02 - 31 for HSBC Bank
// 99 - 02 - 40 for ING Bank
// 99 - 02 - 60 for Rabobank International
// 99 - 02 - 70 for KBC Bank Ireland

// 99 - 04	Bank of Scotland
// 99 - 06 to 99 - 07	Permanent TSB
// 99 - 10	BNP Paribas Ireland for Irish Credit Unions
// 99 - 21 to 99 - 22	Irish Credit Unions
