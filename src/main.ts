
class RuleRequired implements RuleInterface{

    public message(): String{
        return "This field :field is required";
    }

    public passes({ attrs, value }: RuleArgs): Boolean{   
        return !!value;
    }
}

class RuleMin implements RuleInterface{

    public message(): String{
        return "This field :field must by large :min";
    }

    public passes({ attrs, value }: RuleArgs): Boolean{
        return value > attrs.min;
    }
}

const validationRules = {
    title: [
        new Rule(new RuleRequired),
        rule(new RuleRequired)
    ],
    test: [
        rule(new RuleRequired),
        rule(new RuleMin).setAttrs({ min: 5 })
    ]
};

const validator = Validator.make({}, validationRules);

console.log(validator.errors());
