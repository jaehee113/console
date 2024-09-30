=begin

  The rake files dependent on this main rakefile can be found in tasks/*.rake

=end

require "rubygems"
require "rake"
require 'securerandom'
require "time"
require "fileutils"
require "json"
require "yaml"

SOURCE = '.'
CONFIG = {
  'version' => "1.0.0",
  'layouts' => File.join(SOURCE, "_layouts"),
  'posts' => File.join(SOURCE, "_posts"),
  'categories' => File.join(SOURCE, "category"),
  'data' => File.join(SOURCE, "_data"),
  'post_ext' => "md",
  'cat_file' => '_data/categories.json',
  'trans_file' => '_data/localization.json',
  'config_file' => '_config.yml'
}

=begin
  Common Functions
=end

# asking user for further options
def ask(message, valid_options)
  if valid_options
    answer = get_stdin("#{message} #{valid_options.to_s.gsub(/"/, '').gsub(/, /,'/')} ") while !valid_options.include?(answer)
  else
    answer = get_stdin(message)
  end
  answer
end

def get_stdin(message)
  print message
  STDIN.gets.chomp
end

# creates category folder and index.md associated with that category
def create_cat(title, id, subcat_of = nil)
  if(subcat_of == nil)
    FileUtils::mkdir_p File.join(CONFIG['categories'], "#{id}")
    filename = File.join(CONFIG['categories'], "#{id}/index.#{CONFIG['post_ext']}")
  else
    FileUtils::mkdir_p File.join(CONFIG['categories'], "#{subcat_of}/#{id}")
    filename = File.join(CONFIG['categories'], "#{subcat_of}/#{id}/index.#{CONFIG['post_ext']}")
  end

  if(File.exist?(filename))
    abort("rake aborted") if ask("#{filename} already exists. Overwrite?", ['y', 'n']) == 'n'
  end

  if(subcat_of != nil)
    puts "Creating new subcategory: #{filename}."

    open(filename, 'w') do |category|
      category.puts "---"
      category.puts "layout: post"
      category.puts "title: #{title}"
      category.puts "category: #{id}"
      category.puts "---"
      category.puts ""
      category.puts "{% include category.html param = page.layout %}"
    end
  else
    puts "Creating new category: #{filename}."

    open(filename, 'w') do |category|
      category.puts "---"
      category.puts "layout: category"
      category.puts "title: #{title}"
      category.puts "category: #{id}"
      category.puts "---"
      category.puts ""
      category.puts "{% include category.html param = page.layout %}"
    end
  end
end

#modifies category index.md file
def modify_cat(id, title = nil)
  filename = File.join(CONFIG['categories'], "#{id}/index.#{CONFIG['post_ext']}")
  puts "Modifying category " + id + " ..."
  modify_cat_cont(id, false, title)
end

def modify_subcat(parent_id, child_id, title = nil)
  filename = File.join(CONFIG['categories'], "#{parent_id}/#{child_id}/index.#{CONFIG['post_ext']}")
  puts "Modifying subcategory " + parent_id + " belonging to category " + child_id + " ..."
  modify_cat_cont(child_id, true, title)
end

def modify_cat_cont(id, isSubcat, title = nil)
  extracted_title = ""

  if(title == nil)
    cat_file = File.read(CONFIG['cat_file'])
    cat_file_hash = JSON.parse(cat_file)
    cat_file_hash.each do |elem|
      if !isSubcat
        if( elem['id'] == id)
          extracted_title = elem['title']
        end
      else
        if (elem['subcategories'] != nil)
          for subelem in elem['subcategories']
            if( subelem['id'] == id)
              extracted_title = subelem['title']
            end
          end
        end
      end
    end
  end

  open(filename, 'w') do |category|
    category.puts "---"
    if !isSubcat
      category.puts "layout: category"
    else
      category.puts "layout: post"
    end
    if(title == nil)
      category.puts "title: #{extracted_title}"
    else
      category.puts "title: #{title}"
    end
    category.puts "category: #{id}"
    category.puts "---"
    category.puts ""
    category.puts "{% include category.html param = page.layout %}"
  end
end

# renames the specified directory
def rename_directory(prev, curr)
  File.rename prev, curr
end

def delete_directory(parent, child)
  FileUtils::rm_rf(parent + '/' + child)
  puts parent + '/' + child + " directory has been deleted."
end

# takes an id and executes localization tasks
def localize(id)
  #loading _config.yml to fetch languages option.
  config_yml = YAML.load_file(CONFIG['config_file'])
  available_langs = config_yml['languages']
  translated = Hash.new

  puts "Creating new localization data ..."

  #localization step
  for lang in available_langs
    puts "Please enter " + lang + " translation for the category '" + id + "':"
    ARGV.clear
    response = gets.chomp()
    translated[lang] = response
  end

  tempJSON = Hash.new
  tempJSON[id] = translated
  permJSON = tempJSON.to_json
  permJSON[0] = "" # will have to remove the first { to concatenate to existing string.

  #parsing
  permJSON.insert(permJSON.index('{'), '[')

  indexes = Array.new

  for i in (0..permJSON.length)
    if(permJSON[i] == ',')
      indexes.push(i)
    end
  end

  counter = 0

  for idx in indexes
    permJSON.insert(idx + counter, '}')
    permJSON.insert(idx + counter + 2, '{')
    counter += 2
  end

  permJSON.insert(permJSON.rindex('}'), ']')

  #adding the localization for the category into localization.json file
  File.truncate(CONFIG['trans_file'], File.size(CONFIG['trans_file']) - 1)
  File.open(CONFIG['trans_file'], 'a') do |trans|
    trans.write(',' + permJSON)
  end
end

def validate(env_var)
  if(ENV[env_var] == nil)
    abort("rake aborted! Please provide " + env_var + " option.")
  end
end

def directory_check(config_var)
  config_var = CONFIG[config_var]
  abort("rake aborted: '#{config_var}' directory not found.") unless FileTest.directory?(config_var)
end

def hash_write_to_json_file(hash_file, file_name)
    # convert hash back to json
    json_file = JSON.generate(hash_file)

    # clears the actual file and write the result to it
    File.open(CONFIG[file_name], 'w') do |cat|
      cat.write(json_file)
    end
end

# Loads all separate rake files
Dir['tasks/*.rake'].sort.each { |f| load f }