namespace "post" do
  # Usage: rake post:create title="Title" [date="2017-01-13"] [category="category"]
  # remove []! this is only to say that these fields are optional.
  # By default, every post's commenting functionality will be on. Change if necessary.
  desc "Create a new post in #{CONFIG['posts']}"
  task :create do

    directory_check('posts')
    validate('title')

    title = ENV["title"]
    category = ENV["category"] || ""
    slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

    begin
      date = ( ENV['date'] ? Time.parse(ENV['date']) : Time.now).strftime('%Y-%m-%d')
    rescue => e
      puts "Error: date format must be YYYY-MM-DD, please check it once more"
      exit -1
    end

    filename = File.join(CONFIG['posts'], "#{date}-#{slug}.#{CONFIG['post_ext']}")

    if(File.exist?(filename))
      abort("rake aborted") if ask("#{filename} already exists. Overwrite?", ['y', 'n']) == 'n'
    end

    puts "Creating new post: #{filename}."

    open(filename, 'w') do |post|
      post.puts "---"
      post.puts "layout: post"
      post.puts "title: \"#{title.gsub(/-/, ' ')}\""
      post.puts "category: #{category}"
      post.puts "date: #{date}"
      post.puts "comments: true"
      post.puts "disqus_identifier: #{SecureRandom.hex(8)}"
      post.puts "highlights: false"
      post.puts "---"
    end

    puts "Post '#{title}' has been successfully created!"
  end

end
