import os
import re
from datetime import datetime


def get_file_list():
    script_dir = "Script"
    file_list = []
    for root, dirs, files in os.walk(script_dir):
        if "BackUp" in root.split(os.sep):
            continue
        for file in files:
            if file == "sendNotify.js":
                continue
            if file.endswith(".js"):  # 根据需要修改文件类型
                file_path = os.path.join(root, file)
                file_list.append(file_path)
    return file_list


def extract_script_info(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r"new Env\(['\"](.+?)['\"]\)", content)
    if match:
        application_name = match.group(1)
    else:
        application_name = "Unknown"
    script_name = os.path.splitext(os.path.basename(file_path))[0]
    available_date = datetime.today().strftime("✅(%Y/%m/%d)")
    maintenance_status = "✅️"
    return application_name, script_name, available_date, maintenance_status


def generate_table_rows(file_list, existing_rows):
    table_rows = []
    for file_path in file_list:
        application_name, script_name, available_date, maintenance_status = extract_script_info(file_path)
        script_name_exists = any(script_name.strip() in row for row in existing_rows)
        if not script_name_exists:
            script_url = f"https://github.com/xzxxn777/Surge/blob/main/{file_path.replace(os.sep, '/')}"
            row = f"\n| {application_name} | [{script_name}]({script_url}) | {available_date} | {maintenance_status} |"
            table_rows.append((script_name, row))
    return table_rows


def update_readme(file_list):
    readme_path = "README.md"
    with open(readme_path, "r", encoding='utf-8') as readme_file:
        content = readme_file.read()
    table_header_pattern = r"(\|   Application   \|.*?\|\n)"
    table_end_pattern = r"(\n\n|$)"
    table_header_match = re.search(table_header_pattern, content)
    if not table_header_match:
        print("Table header not found in README.md")
        return
    table_end_match = re.search(table_end_pattern, content[table_header_match.end():])
    if not table_end_match:
        print("Table end not found in README.md")
        return
    table_start = table_header_match.end()
    table_end = table_start + table_end_match.start()
    existing_table_content = content[table_start:table_end].splitlines()
    new_table_rows = generate_table_rows(file_list, existing_table_content)
    sorted_new_table_rows = sorted(new_table_rows, key=lambda x: x[0])
    new_content = content[:table_end] + ''.join(row[1] for row in sorted_new_table_rows) + content[table_end:]
    with open(readme_path, "w", encoding='utf-8') as readme_file:
        readme_file.write(new_content)


if __name__ == "__main__":
    files = get_file_list()
    update_readme(files)
