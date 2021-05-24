interface RuleArgs{
    attrs: {[key: string]: any},
    value: any
}

interface RuleInterface{
    message(): String,
    passes(value: RuleArgs): Boolean
}

const rule = (rule: RuleInterface): Rule => new Rule(rule);

const messageReplacer = (args: { [key: string]: string}, message: String): String => {
    
    Object.keys(args).forEach((key:string) => {  
        message = message.replace(new RegExp(`:${key}`, "gi") , args[key]);
    });

    return message;
}

class Rule{

    private rule: RuleInterface;
    private message: String = "";
    private attrs: {[key: string]: any} = {};
    private field:string;

    constructor(rule: RuleInterface){
        this.rule = rule;
        this.message = this.rule.message();
    }

    public setMessage(message: String | null = null): Rule{
        this.message = message;
        return this;
    }

    public setAttrs(attrs: {[key: string]: any}): Rule{
        this.attrs = attrs;
        return this;
    }

    public setField(field: string): Rule{
        this.field = field;
        return this;
    }

    private getMessage(args:{ [key: string]: string }): String{
        return messageReplacer(args, this.message);
    }

    public run(value: any): String | Boolean{
        const { field, attrs } = this;
        const message = this.getMessage({
            value,
            field,
            ...attrs
        });
        return this.rule.passes({ attrs: this.attrs, value }) || message;
    }
}

class Validator{

    private constructor() {}

    private response: {[key:string]: Array<String>} = {};

    private static getInstance(){
        return new Validator();
    }

    public static make(
            body: { [key: string]: any }, 
            validationRules: { [key: string]: Array<Rule> }
    ): Validator {
        let instance: Validator = Validator.getInstance();
        Object.keys(validationRules)
            .forEach((attr: string) => {
                const value: any = body[attr] || null;
                const errors: Array<String> = [];
                for(const rule of validationRules[attr]){
                    const result: Boolean | String = rule.setField(attr).run(value);
                    if(typeof result === "string") errors.push(result);
                }
                if(errors.length) instance.response[attr] = errors;
            })
        
        return instance;
    }

    public errors(): Object{
        return this.response;
    }

    public fails(): Number{
        return Object.keys(this.response).length;
    }
}
