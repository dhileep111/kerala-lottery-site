import os
import datetime
from bs4 import BeautifulSoup

def update_html_file(file_path, lottery_code, first_prize_number, date_string):
    """Safely updates the HTML using BeautifulSoup."""
    if not os.path.exists(file_path):
        print(f"⚠️ Could not find {file_path}. Skipping.")
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # 1. Update the Ticker (Always starts with LIVE: LotteryName Code-XXX)
    ticker = soup.find('div', class_='ticker-scroll')
    if ticker:
        for span in ticker.find_all('span'):
            if "LIVE:" in span.text:
                lottery_name = span.text.split(" ")[1] # Extracts "Karunya" or "Nirmal"
                span.string = f"LIVE: {lottery_name} {lottery_code} Result Out | 1st Prize {first_prize_number}"

    # 2. Update the Main Card Header (e.g., Karunya KR-753)
    rc_name = soup.find('div', class_='rc-name')
    if rc_name:
        lottery_name = rc_name.text.split(" ")[0]
        rc_name.string = f"{lottery_name} {lottery_code}"

    # 3. Update the Date inside the Card
    rc_meta = soup.find('div', class_='rc-meta')
    if rc_meta:
        date_span = rc_meta.find('span')
        if date_span:
             # Keep the SVG icon, just replace the text
             date_span.clear()
             date_span.append(BeautifulSoup('<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', 'html.parser'))
             date_span.append(f" {date_string}")

    # 4. Update the 1st Prize Number in the big card
    prize_number = soup.find('div', class_='prize-number')
    if prize_number:
        prize_number.string = first_prize_number

    # 5. Update the Detailed Result Table
    table_body = soup.find('tbody', id='res-body')
    if table_body:
        # Find the first row (1st prize)
        first_row = table_body.find('tr')
        if first_row:
             chip = first_row.find('span', class_='chip')
             if chip:
                 chip['data-num'] = first_prize_number
                 chip.string = first_prize_number

    # Save the file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    
    print(f"✅ Successfully updated {file_path}")
    return True

def main():
    print("=========================================")
    print("🏆 KERALA TICKET RESULTS - FAST UPDATER 🏆")
    print("=========================================")
    print("This script will update index.html and the specific lottery page.")
    
    # 1. Get User Input
    lottery_target = input("Which lottery is it today? (e.g., karunya, nirmal, akshaya): ").strip().lower()
    lottery_code = input("What is the draw code? (e.g., KR-753): ").strip().upper()
    first_prize = input("What is the 1st Prize Number? (e.g., KN 844574): ").strip().upper()
    
    # 2. Format Date (e.g., May 09, 2026)
    today = datetime.datetime.now()
    date_string = today.strftime("%B %d, %Y")
    print(f"\nProcessing updates for {date_string}...")

    # 3. Define target files
    # We ALWAYS update index.html
    target_files = ['index.html']
    
    # We ALSO update the specific inner page
    inner_page = f"{lottery_target}.html"
    target_files.append(inner_page)

    # 4. Run the updates
    for file in target_files:
        update_html_file(file, lottery_code, first_prize, date_string)

    print("\n🚀 Done! Type the following commands in your terminal to push live:")
    print('git add .')
    print(f'git commit -m "Auto-update: {lottery_code} Results"')
    print('git push')

if __name__ == "__main__":
    main()
