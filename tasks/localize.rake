namespace "localize" do
  # Usage: rake localize:create id=""
  desc "Create a new localization data in #{CONFIG['data']}"
  task :create do

    directory_check('data')
    validate('id')

    id = ENV['id']
    localize(id)
    puts "Localization data '#{id}' has been successfully created."
  end

  # Usage rake localize:list
  desc "Show the list of every localized data in #{CONFIG['data']}"
  task :list do

    directory_check('data')

    puts "---------------"

    trans_file = File.read(CONFIG['trans_file'])
    trans_file_hash = JSON.parse(trans_file)
    trans_file_hash.each do |elem|
      puts elem[0]
    end

    puts "---------------"
  end

  # Usage rake localize:query id=""
  desc "Returns the localization data for supplied id"
  task :query do

    directory_check('data')
    validate('id')

    trans_file = File.read(CONFIG['trans_file'])
    trans_file_hash = JSON.parse(trans_file)
    trans_file_hash.each do |elem|
      if(elem[0] == ENV['id'])
        puts elem[1]
      end
    end
  end

end