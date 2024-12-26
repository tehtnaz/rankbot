if [[ "$1" == "latest" ]] || [[ "$1" == "" ]]; then
    latest="prettier"
    for file in ./logs/*
    do
        tmp_first=${file%.log}
        tmp=${tmp_first#*./logs/}
        if (($latest == "prettier")); then
            latest=$tmp
        elif (($tmp > $latest)); then
            latest=$tmp
        fi;
    done
    cat ./logs/$latest.log | npx pino-pretty -i pid,hostname -t 'SYS:yyyy-mm-dd HH:MM:ss.l' > ./logs/prettier.log
    echo "Outputted file ./logs/$latest.log (latest) to ./logs/prettier.log";
else
    if [ -f $1 ]; then
        cat $1 | npx pino-pretty -i pid,hostname -t 'SYS:yyyy-mm-dd HH:MM:ss.l' > ./logs/prettier.log
        echo "Outputted file $1 to ./logs/prettier.log";
    else
        echo "Bad file input (doesn't exist)";
        exit 1;
    fi;
fi;