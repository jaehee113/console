=begin
    Typechecker Plugin

    Developed by Jae Hee Lee @ 2017

    Checks string and determine the original date type of the character
    (e.g. '12' will be interpreted as an integer)
=end

module Jekyll
    class TypecheckTag < Liquid::Tag
        def lookup(context, name)
            lookup = context
            name.split(".").each { |value| lookup = lookup[value] }
            lookup
        end


        def initialize(tag_name, word, tokens)
            super
            #at the moment the input other than word variable is not used.
            @word = word.to_s

        end

        def render(context)
            if /\A[-+]?\d+\z/.match("#{lookup(context, 'word')}")
                @result = 'int'
            else
                @result = 'string'
            end
        end
    end
end

Liquid::Template.register_tag('typecheck', Jekyll::TypecheckTag)
