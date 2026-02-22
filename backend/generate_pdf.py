from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Universal Basic Income Pilot Policy Document', align='C', new_x='LMARGIN', new_y='NEXT')
        self.ln(10)

pdf = PDF()
pdf.add_page()
pdf.set_font('helvetica', '', 12)

content = """
Title: Universal Basic Income (UBI) Pilot Program - Model B
Draft Version: 2.4
Date: October 24, 2024

1. Executive Summary
This document outlines the fiscal parameters for the proposed Universal Basic Income (UBI) pilot program targeting vulnerable demographics. The objective is to evaluate the economic impact of guaranteed income on local economies and individual financial stability.

2. Fiscal Commitments
The government commits to a direct spending allocation of $4.2 Billion USD over the lifecycle of this pilot. These funds will be distributed directly to eligible participants through a tiered payout system.

3. Revenue Impact Assessment
Economic modeling suggests this policy will result in a near-term tax base contraction. We project a revenue impact of -1.5 percentage points as specific corporate tax incentives are restructured to partially fund the initiative. 

4. Policy Duration
The pilot program is designed for a strict implementation and evaluation period of 60 months (5 years). After this duration, a comprehensive review will determine whether to scale the program nationally or terminate it.

5. Primary Sectors Affected
The immediate economic impacts are expected to be concentrated within the following sectors:
- Social Welfare
- Treasury
- Retail and Consumer Goods

6. Implementation Timeline
Q1 2025 - Participant selection and disbursement infrastructure setup
Q2 2025 - Initial disbursements commence
Q4 2029 - Final disbursements and program conclusion
"""

pdf.multi_cell(0, 10, content)

# Save to multiple locations so it's easy to find
paths = [
    '../frontend/public/Sample_UBI_Policy.pdf',
    '../Sample_UBI_Policy.pdf'
]

for path in paths:
    pdf.output(path)
    print(f"PDF generated successfully at: {os.path.abspath(path)}")
